import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { jsPDF } from 'jspdf';
import { ReportData } from '../../../models/poornam-report';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-report-dailystmnt-transaction',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
  ],
  templateUrl: './report-dailystmnt-transaction.component.html',
  styleUrl: './report-dailystmnt-transaction.component.css',
})
export class ReportDailystmntTransactionComponent {
  displayedColumns: string[] = [
    'BillNo',
    'BillDate',
    'Vazhipad',
    'Name',
    'Star',
    'Qty',
    'Rate',
    'Amount',
    'VazhiDate',
    'TrnsMode',
  ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 7, 10, 20, 50];
  pageIndex = 0;
  data: ReportData[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  currentDate: string = '';
  currentPage: number = 1;
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      const fromDate = params['fromDate'];
      const toDate = params['toDate'];
      this.fetchReportData(type, fromDate, toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    const payLoad = {
      Type: type,
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
        this.groupDataByTransactionMode(this.data); // Group the data
        this.data = data.sort((a: any, b: any) => {
          const [numA, denomA] = a.BillNo.split('/').map(Number);
          const [numB, denomB] = b.BillNo.split('/').map(Number);

          // Compare the two parts: first compare the numerator, then the denominator
          return numA - numB || denomA - denomB;
        });
        this.dataSource.data = this.data;
        this.length = data.length;
        this.dataSource.paginator = this.paginator;

        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  // Grouping function
  groupDataByTransactionMode(data: ReportData[]): void {
    this.groupedData = data.reduce((acc, item) => {
      (acc[item.TrnsMode] = acc[item.TrnsMode] || []).push(item);
      return acc;
    }, {} as { [key: string]: ReportData[] });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  goBack(): void {
    console.log('Going back...'); // Log to verify method execution
    this.router.navigate(['/getReport']);
  }

  // generatePDF(): void {
  //   const element = document.getElementById('pdf-content');
  //   const options = {
  //     margin: [0.5, 0.5, 0.5, 0.5],
  //     filename: 'report.pdf',
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  //     pagebreak: { mode: ['css', 'legacy'] } // Use 'css' to respect CSS page breaks
  //   };

  //   if (element) {
  //     html2pdf().set(options).from(element).save();
  //   } else {
  //     console.error("PDF content container not found!");
  //   }

  // }

  generatePDF(): void {
    const element = document.getElementById('pdf-content');
    if (!element) {
      console.error('PDF content container not found!');
      return;
    }

    const options = {
      margin: [30, 10, 30, 10], // Top, right, bottom, left margins
      filename: 'report.pdf',
      html2canvas: { scale: 2 }, // High-quality rendering
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid'] }, // Prevent breaking rows across pages
    };

    html2pdf()
      .from(element)
      .set(options)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');

          // Add Header
          pdf.text('Temple Name', pageWidth / 2, 15, { align: 'center' });
          pdf.setFontSize(10);
          pdf.text('Temple Address', pageWidth / 2, 20, { align: 'center' });

          // Add Footer
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pageWidth - 20,
            pageHeight - 10,
            { align: 'right' }
          );
        }
      })
      .save();
  }

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ba':
        return 'Bank';
      case 'cs':
        return 'CASH';
      case 'mo':
        return 'MONEY ORDER';
      case 'up':
        return 'UPI';
      case 'ch':
        return 'CHEQUE';
      case 'cr':
        return 'CREDIT';
      case 'de':
        return 'DEBIT';

      default:
        return 'Unknown';
    }
  }
}

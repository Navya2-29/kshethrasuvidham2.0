import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import 'jspdf-autotable';
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
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-report-counter-transaction',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
    
  ],
  templateUrl: './report-counter-transaction.component.html',
  styleUrl: './report-counter-transaction.component.css'
})
export class ReportCounterTransactionComponent {
  displayedColumns: string[] = [
    'BillNo',
    
    'BillDate',
    "Counter",
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
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  objectKeys = Object.keys;
  data: ReportData[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: {
    [key: string]: {
      [key: string]: { data: ReportData[]; total: number };
    };
  } = {};
  currentDate: string = '';
  currentPage: number = 1;
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http:HttpClient,
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
      Type: "DailyStmt",
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

  getTransactionType(transmode: string): string {
    console.log(transmode);
    switch (transmode) {
      case 'ON':
        return 'Bank';
      case 'CS':
        return 'CASH';
      case 'MO':
        return 'MONEY ORDER';
      case 'UP':
        return 'UPI';
      case 'CH':
        return 'CHEQUE';
      case 'CR':
        return 'CREDIT';
        
      case 'DE':
        return 'DEBIT';

      default:
        return 'OTHERS';
    }
  }

  getRowSpan(counter: string): number {
    return Object.keys(this.groupedData[counter]).length;
  }
  getGrandTotal(): number {
    let grandTotal = 0;
    // Iterate over all counters and transaction modes to sum up the totals
    Object.keys(this.groupedData).forEach(counter => {
      Object.keys(this.groupedData[counter]).forEach(transMode => {
        grandTotal += this.groupedData[counter][transMode].total;
      });
    });
    return grandTotal;
  }
  // Grouping function
  groupDataByTransactionMode(data: ReportData[]): void {
    this.groupedData = data.reduce((acc, item) => {
      // Initialize CounterId group
      if (!acc[item.CounterId]) {
        acc[item.CounterId] = {};
      }
  
      // Initialize TransMode group within CounterId
      if (!acc[item.CounterId][item.TrnsMode]) {
        acc[item.CounterId][item.TrnsMode] = { data: [], total: 0 };
      }
  
      // Add the current item to the data array
      acc[item.CounterId][item.TrnsMode].data.push(item);
  
      // Update the total for the group
      acc[item.CounterId][item.TrnsMode].total += +item.Amount;
  
      return acc;
    }, {} as {
      [key: string]: {
        [key: string]: { data: ReportData[]; total: number };
      };
    });
  
    console.log(this.groupedData);
     
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  goBack(): void {
    console.log('Going back...'); // Log to verify method execution
    this.router.navigate(['/getReport']);


    if (window.history.length > 1) {
      window.history.back(); // Goes back to the previous page in history
    } else {
      window.close(); // Closes the tab if it's the only page open
    }


  }

  generatePDF(): void {
    const doc = new jsPDF();

    // Header
   // Header (Center-aligned)
   this.http
    .get('assets/fonts/malayalam/NotoSansMalayalam-Regular.ttf', {
      responseType: 'arraybuffer',
    })
    .subscribe(
      (fontData) => {
        const doc = new jsPDF();

        // Convert ArrayBuffer to Base64
        const fontBase64 = btoa(
          String.fromCharCode(...new Uint8Array(fontData))
        );

        // Add the font to jsPDF
        doc.addFileToVFS(
          'NotoSansMalayalam-Regular.ttf',
          fontBase64
        );
        doc.addFont(
          'NotoSansMalayalam-Regular.ttf',
          'NotoSansMalayalam',
          'normal'
        );

        // Set the custom font
        doc.setFont('NotoSansMalayalam');

  const header = 'Counter Transaction- Counter Transactions';
  const pageWidth = doc.internal.pageSize.width;
  const headerWidth = doc.getStringUnitWidth(header) * doc.internal.scaleFactor;
  const headerX = (pageWidth - headerWidth) / 2; // Center the header text
  doc.setFontSize(16);
  doc.text(header, headerX, 20);

  // Date (Center-aligned)
  const dateText = 'Date: ' + new Date().toLocaleDateString();
  const dateWidth = doc.getStringUnitWidth(dateText) * doc.internal.scaleFactor;
  const dateX = (pageWidth - dateWidth) / 2; // Center the date text
  doc.setFontSize(12);
  doc.text(dateText, dateX, 30);
    // Table: Start from y position 40 to avoid header overlap
    const startY = 40;
    const columns = ['CounterId', 'TransMode', 'Total'];
    const rows = this.prepareTableRows();

    // Use autoTable to generate the table in PDF
    (doc as any).autoTable({
      startY: startY,
      head: [columns],
      body: rows,
      theme: 'grid',  // You can change the table style
      headStyles: { fillColor: [0, 123, 255] },  // Header color (Blue)
      margin: { top: 10, left: 10, right: 10 },
      columnStyles: {
        2: { halign: 'right' }  // Align total column to the right
      }
    });

    // Footer
    // const pageCount = doc.internal.getNumberOfPages();
    // doc.setFontSize(10);
    // doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });

    // Save the PDF
    // doc.save('report.pdf');
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    // doc.save('vazhipad_report_with_header_footer.pdf');



  },
  (error:any) => {
    console.error('Error loading font:', error);
  }
);


  }

  // Prepare the table rows from grouped data
  prepareTableRows(): any[] {
    const rows = [];
    for (const counter of this.objectKeys(this.groupedData)) {
      for (const transMode of this.objectKeys(this.groupedData[counter])) {
        const row = [
          counter,
          transMode,
          this.groupedData[counter][transMode].total.toFixed(2)
        ];
        rows.push(row);
      }
    }
    return rows;
  }


  
  getTotalAmount(): number {
    return this.data.reduce((sum, item) => sum + item.Amount, 0);
  }
}


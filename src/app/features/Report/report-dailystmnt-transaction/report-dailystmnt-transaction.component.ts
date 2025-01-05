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
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';
@Component({
  selector: 'app-report-dailystmnt-transaction',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule, MatInputModule,
  ],
  templateUrl: './report-dailystmnt-transaction.component.html',
  styleUrl: './report-dailystmnt-transaction.component.css',
})
export class ReportDailystmntTransactionComponent {
  displayedColumns: string[] = [
    
    'BillDate',
    'Vazhipad',
    
    'Qty',
    'Rate',
    'Amount',
    
    'TrnsMode',
  ];
  dataSource = new MatTableDataSource<ReportDailyStmt>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data: ReportDailyStmt[] = [];
  fromDate:string;
  toDate:string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportDailyStmt[] } = {};
  currentDate: string = '';
  currentPage: number = 1;
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http:HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
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
        // this.data = data.sort((a: any, b: any) => {
        //   const [numA, denomA] = a.BillNo.split('/').map(Number);
        //   const [numB, denomB] = b.BillNo.split('/').map(Number);

          // Compare the two parts: first compare the numerator, then the denominator
          // return numA - numB || denomA - denomB;
        // });
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
  groupDataByTransactionMode(data: ReportDailyStmt[]): void {
    this.groupedData = data.reduce((acc, item) => {
      (acc[item.TrnsMode] = acc[item.TrnsMode] || []).push(item);
      return acc;
    }, {} as { [key: string]: ReportDailyStmt[] });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  goBack(): void {
    console.log('Going back...'); // Log to verify method execution
    this.router.navigate(['/getReport']);
  }

  
  generatePDF() {
    const templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    const templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const headerHeight = 35;
    const footerHeight = 20;
    const lineHeight = 5;
    const tableHeaderFontSize = 10;
    const contentFontSize = 9;
    const maxColumnWidths = [20, 60, 25, 25, 25]; // BillNo, Name, Vazhipad, Star, Ennam (Qty), Rate, Amount
    let y = headerHeight;
    let grandTotal = 0;
    this.http.get('assets/fonts/malayalam/NotoSansMalayalam-Regular.ttf', { responseType: 'arraybuffer' }).subscribe(
      (fontData) => {
        const doc = new jsPDF();
        const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontData)));
        doc.addFileToVFS('NotoSansMalayalam-Regular.ttf', fontBase64);
        doc.addFont('NotoSansMalayalam-Regular.ttf', 'NotoSansMalayalam', 'normal');
        doc.setFont('NotoSansMalayalam');

        // Group data by TransactionMode and then by Vazhipad
        const groupedData = this.data.reduce((acc, current) => {
          const key = current.TrnsMode;
          if (!acc[key]) {
            acc[key] = {};
          }
          if (!acc[key][current.vazhipad]) {
            acc[key][current.vazhipad] = { Qty: 0, Rate: current.Rate, Total: 0 };
          }
          // Sum the Qty and calculate the Total for each Vazhipad
          acc[key][current.vazhipad].Qty += current.Qty;
          acc[key][current.vazhipad].Total += current.Qty * current.Rate;
          return acc;
        }, {} as { [key: string]: { [key: string]: { Qty: number; Rate: number; Total: number } } });

        // Draw Header
        const drawHeader = () => {
          doc.setFontSize(12);
          doc.setFont("NotoSansMalayalam", "bold");
          doc.text(templeName, pageWidth / 2, 12, { align: "center" });
          doc.setFont("NotoSansMalayalam", "normal");
          doc.setFontSize(10);
          doc.text(templeAddress, pageWidth / 2, 18, { align: "center" });

          doc.setFontSize(10);
          doc.setFont("NotoSansMalayalam", "bold");
          doc.text("Daily Statement Collection - Temple", pageWidth / 2, 27, { align: "center" });
          doc.text(`${this.fromDate} -${this.toDate}`, pageWidth / 2, 32, { align: "center" });
          doc.setLineWidth(0.5);
          doc.line(10, y, pageWidth - 10, y); // Line below header
          y += 3;
        };

        // Draw Footer
        const drawFooter = (pageNum: number) => {
          doc.setFontSize(10);
          const footerText = `Page ${pageNum}`;
          doc.text(footerText, pageWidth / 2, pageHeight - footerHeight / 2, { align: "center" });
        };

        // Add Table Header
        const drawTableHeader = () => {
          doc.setFontSize(tableHeaderFontSize);
          doc.setFont("NotoSansMalayalam", "bold");
          const headers = ["SINO.", "VAZHIPAD", "QTY", "RATE", "AMOUNT"];
          let x = 10;
          headers.forEach((header, index) => {
            doc.text(header, x, y + 5);
            x += maxColumnWidths[index];
          });

          y += lineHeight+5;
          doc.setLineWidth(0.5);
          doc.line(10, y, pageWidth - 10, y); // Line below the header
          y += 2;
        };

        // Initialize PDF
        drawHeader();
        drawFooter(1);
        drawTableHeader();

        let pageNum = 1;

        // Render Grouped Data
        for (const [group, entries] of Object.entries(groupedData)) {
          // Check if enough space for group header, add page if not
          if (y + lineHeight > pageHeight - footerHeight - 20) {
            doc.addPage();
            pageNum++;
            y = headerHeight + 5; // Reset y position after new page
            drawHeader();
            drawFooter(pageNum);
            drawTableHeader();
          }

          // Draw Group Header with extra spacing to avoid overlap with the table header line
          doc.setFontSize(12);
          doc.setFont("NotoSansMalayalam", "bold");

          y += lineHeight; // Increase spacing between the group name and table header
          doc.text(`${this.getTransactionType(group)}`, 10, y);
          y += lineHeight; // Additional space below group header

          let groupTotal = 0; // Initialize group total

          // Draw Entries in Table Format
          let serialNumber = 1; // Initialize serial number for the group
          for (const [vazhipad, values] of Object.entries(entries)) {
            // Ensure Rate and Total are numbers
            const rate = Number(values.Rate);
            const total = Number(values.Total);

            // Check if enough space for the row, add page if not
            if (y + lineHeight > pageHeight - footerHeight - 10) {
              doc.addPage();
              pageNum++;
              y = headerHeight + 5; // Reset y position after new page
              drawHeader();
              drawFooter(pageNum);
              drawTableHeader();
            }

            doc.setFontSize(contentFontSize);
            doc.setFont("NotoSansMalayalam", "normal");

            const row = [
              serialNumber.toString(),
              vazhipad, // Vazhipad text
              values.Qty.toString(), // Sum of Qty for each Vazhipad
              rate.toFixed(2), // Rate for each Vazhipad
              total.toFixed(2), // Total = Rate * Qty
            ];
            let x = 10;

            row.forEach((cell, index) => {
              if (index === 2 || index === 3 || index === 4) {
                // Right-align for Qty, Rate, and Amount
                doc.text(String(cell), x + maxColumnWidths[index] - 10, y + 5, { align: "right" });
              } else {
                doc.text(String(cell), x, y + 5);  // Left-align the others
              }
              x += maxColumnWidths[index];
            });

            groupTotal += total; // Add to group total
            grandTotal += total; // Add to grand total
            y += lineHeight;
            serialNumber++; // Increment serial number
          }

          // Draw Group Total
          if (y + lineHeight > pageHeight - footerHeight - 10) {
            doc.addPage();
            pageNum++;
            y = headerHeight + 5; // Reset y position after new page
            drawHeader();
            drawFooter(pageNum);
            drawTableHeader();
          }

          // Add group total at the end
          const groupTotalX = 10 + maxColumnWidths[0] + maxColumnWidths[1] + maxColumnWidths[2] + maxColumnWidths[3]+maxColumnWidths[3];
          doc.setFontSize(12);
          doc.setFont("NotoSansMalayalam", "bold");
          doc.text(`Total (${this.getTransactionType(group)}):`, 10, y + 5); // Label for the group total
          doc.text(`${groupTotal.toFixed(2)}`,groupTotalX - 10, y + 5, { align: "right" }); // Total with transaction mode

          y += lineHeight + 5; // Add space after the total for the next group or footer
        }
        const groupTotalX = 10 + maxColumnWidths[0] + maxColumnWidths[1] + maxColumnWidths[2] + maxColumnWidths[3]+maxColumnWidths[3];

        // Add Grand Total below the last Group Total
        doc.setFontSize(12);
        doc.setFont("NotoSansMalayalam", "bold");
        doc.text("Grand Total:", 10, y + 5); // Label for the grand total
        doc.text(`${grandTotal.toFixed(2)}`, groupTotalX - 10, y + 5, { align: "right" }); // Grand total with text

        y += lineHeight + 10; // Space after the grand total

        // Save PDF
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      },
      (error: any) => {
        console.error('Error loading font:', error);
      }
    );
  }

  
  
  
  

  
  
  
  // Helper function to wrap text for a given column width
  wrapText(doc: jsPDF, text: string, maxWidth: number): string {
    const words = text.split(' ');
    let currentLine = '';
    let wrappedText = '';
  
    words.forEach(word => {
      if (doc.getTextWidth(currentLine + word) < maxWidth) {
        currentLine += word + ' ';
      } else {
        wrappedText += currentLine.trim() + '\n';
        currentLine = word + ' ';
      }
    });
  
    wrappedText += currentLine.trim();
    return wrappedText;
  }
  
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  
  
  
  

  getTransactionType(transmode: string): string {
    switch (transmode) {
      case 'ON':
        return 'ONLINE';
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
}

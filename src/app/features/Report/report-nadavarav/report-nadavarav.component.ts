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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NadavaravReport } from '../../../models/nadavarav.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-report-nadavarav',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './report-nadavarav.component.html',
  styleUrl: './report-nadavarav.component.css'
})
export class ReportNadavaravComponent implements  OnInit {
  
  displayedColumns: string[] = ['BillNo','BillDate','NM_Name', 'Name', 'Star', 'Qty', 'ItemValue','weight', 'Receipt_Amt',  'TrnMode','Remarks' ];
  dataSource = new MatTableDataSource<NadavaravReport>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data: NadavaravReport[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: NadavaravReport[] } = {};
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
      const fromDate = params['fromDate'];
      const toDate = params['toDate'];
      this.fetchReportData(type, fromDate, toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    const payLoad = {
      Type: "NadavaravuRpt",
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
  groupDataByTransactionMode(data: NadavaravReport[]): void {
    this.groupedData = data.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {} as { [key: string]: NadavaravReport[] });
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
  
    const headerHeight = 33;
    const footerHeight = 20;
    const lineHeight = 10;
    const tableHeaderFontSize = 10;
    const contentFontSize = 9;
    const currentDate = new Date().toLocaleDateString();

    // Adjusted column widths for BillNo, Name, Vazhipad, Star, Ennam (Qty), Rate, and Amount
    const maxColumnWidths = [20, 40, 35, 25, 25, 25, 25]; // BillNo, Name, Vazhipad, Star, Ennam (Qty), Rate, Amount
    
    let y = headerHeight; // Initial Y position after header
    let grandTotal = 0; // Initialize grand total
  
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



    // Data grouped by TransactionMode (example grouping key)
    const groupedData = this.data.reduce((acc, current) => {
      const key = current.category; // Change this key if grouping by something else
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(current);
      return acc;
    }, {} as { [key: string]: NadavaravReport[] });
  
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
      doc.text("Nadavaravu Booking Report", pageWidth / 2, 27, { align: "center" });
  // Add current date below the report title but above the table header
  doc.setFontSize(10);
  doc.setFont("NotoSansMalayalam", "normal");
  doc.text(currentDate, pageWidth / 2, 32, { align: "center" });
      doc.setLineWidth(0.5);
      doc.line(10, y, pageWidth - 10, y); // Line below header
      y += 3; // Space below the line
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
      const headers = ["BillNo.", "VAZHIPAD", "NAME", "STAR", "QTY", "I-Value", "RCPT.AMT"];
      let x = 10;
      headers.forEach((header, index) => {
        doc.text(header, x, y + 5);
        x += maxColumnWidths[index];
      });
  
      y += lineHeight;
      doc.setLineWidth(0.5);
      doc.line(10, y, pageWidth - 10, y); // Line below the header
      y += 2; // Space below the line
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
      doc.text(` ${group}`, 10, y);
      y += lineHeight; // Additional space below group header
  
      let groupTotal = 0; // Initialize group total
  
      // Draw Entries in Table Format
      for (const entry of entries) {
        // Ensure Rate and Amount are numbers
        const rate = Number(entry.ItemValue);  // Convert Rate to number
        const amount = Number(entry.Receipt_Amt);  // Convert Amount to number
  
        // Apply .toFixed() only after conversion to number
        const rateFormatted = isNaN(rate) ? '0.00' : rate.toFixed(2);  // Check if Rate is a valid number
        const amountFormatted = isNaN(amount) ? '0.00' : amount.toFixed(2);  // Check if Amount is a valid number
  
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
          entry.BillNo,
          this.wrapText(doc, entry.NM_Name, maxColumnWidths[1] - 5), // Wrap Name text
          this.wrapText(doc, entry.Name, maxColumnWidths[2] - 5), // Wrap Vazhipad text
          entry.Star,
          entry.Qty,  // Ennam (Qty) data goes under Qty column
          rateFormatted,  // Use formatted Rate
          amountFormatted,  // Use formatted Amount
        ];
        let x = 10;
  
        row.forEach((cell, index) => {
          if (index === 4 || index === 5 || index === 6) {
            // Right-align for Qty (Ennam), Rate, and Amount
            doc.text(String(cell), x + maxColumnWidths[index] - 10, y + 5, { align: "right" });
          } else {
            doc.text(String(cell), x, y + 5);  // Left-align the others
          }
          x += maxColumnWidths[index];
        });
  
        groupTotal += amount; // Add to group total
        grandTotal += amount; // Add to grand total
        y += lineHeight;
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
      doc.setFontSize(12);
      doc.setFont("NotoSansMalayalam", "bold");
      doc.text("Group Total:", 10, y + 5); // Label for the group total
      doc.text(groupTotal.toFixed(2), pageWidth - 20, y + 5, { align: "right" }); // Total amount aligned to the right
  
      y += lineHeight + 5; // Add space after the total for the next group or footer
    }
  
    // Add Grand Total below the last Group Total
    doc.setFontSize(12);
    doc.setFont("NotoSansMalayalam", "bold");
    doc.text("Grand Total:", 10, y + 5); // Label for the grand total
    doc.text(grandTotal.toFixed(2), pageWidth - 20, y + 5, { align: "right" }); // Grand total aligned to the right
  
    y += lineHeight + 10; // Space after the grand total
  
    // Save PDF
    // doc.save("Nadavaravu_Report.pdf");
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

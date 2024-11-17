import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { jsPDF } from 'jspdf'; 
import {ReportData} from '../../../models/poornam-report'
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Location } from '@angular/common';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-report-dailystmt',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule],
  templateUrl: './report-dailystmt.component.html',
  styleUrl: './report-dailystmt.component.css'
})
export class ReportDailystmtComponent {

  displayedColumns: string[] = ['BillNo','BillDate','Vazhipad', 'Name', 'Star', 'Qty', 'Rate', 'Amount',  'VazhiDate', ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 7,10, 20, 50];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  constructor(private route: ActivatedRoute, private service: ReportService,private router: Router) {}

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
        this.data=data;
        this.data = data.sort((a:any, b:any) => {
          const [numA, denomA] = a.BillNo.split('/').map(Number);
          const [numB, denomB] = b.BillNo.split('/').map(Number);
          
          // Compare the two parts: first compare the numerator, then the denominator
          return numA - numB || denomA - denomB;
      });
        this.dataSource.data = this.data
        this.length = data.length; 
        this.dataSource.paginator = this.paginator;
        
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
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
    const templeName=localStorage.getItem('TempleName')|| '' ;
    const Adress=localStorage.getItem('Address') || '';
    const doc = new jsPDF();

    // Main Heading
    const mainHeading= templeName  ;
    const subHeading = Adress;
    const reportTitle = 'Daily Statement (Detailed)';

    // Get current date
    const currentDate = new Date();
    const reportDate = `${this.padZero(currentDate.getDate())}/${this.padZero(currentDate.getMonth() + 1)}/${currentDate.getFullYear()}`;

    // Set initial header
    this.addHeader(doc, mainHeading , subHeading, reportTitle, reportDate);

    // Table Header
    let yPosition = 40; // Adjusted starting y-position for the table headers
    this.drawTableHeader(doc, yPosition);

    // Set font to normal for data rows
    doc.setFont('helvetica', 'normal'); // Ensure normal font for data rows
    yPosition += 8; // Move to the next row for data entries

    this.data.forEach(item => {
        // Check for page overflow
        if (yPosition > 280) {
            doc.addPage();
            this.addHeader(doc, mainHeading, subHeading, reportTitle, reportDate); // Add header on new page
            yPosition = 45; // Reset yPosition for new page

            // Redraw table header for new page
            this.drawTableHeader(doc, yPosition);
            yPosition += 8; // Move to next line after header
        }

        // Split text if too long
        const vazhipadText = doc.splitTextToSize(item.Vazhipad, 45);  // Adjusted width for VAZHIPAD
        const nameText = doc.splitTextToSize(item.Name, 40);          // Reduced width for NAME

        // Calculate row height based on the number of lines for the tallest cell in the row
        const lineCount = Math.max(vazhipadText.length, nameText.length);
        const rowHeight = lineCount * 6 + 2;  // Adjust line height as necessary
        doc.setFont('helvetica', 'normal'); 
        doc.setFontSize(10);
        // Add row data with wrapped text
        doc.text(item.BillNo, 14, yPosition);
        doc.text(vazhipadText, 45, yPosition);
        doc.text(nameText, 90, yPosition);  // Adjusted to fit with reduced width
        doc.text(item.Star, 130, yPosition);
        doc.text(item.Qty.toString(), 145, yPosition);
        
        const rate = isNaN(Number(item.Rate)) ? "0.00" : Number(item.Rate).toFixed(2);
        const amount = isNaN(Number(item.Amount)) ? "0.00" : Number(item.Amount).toFixed(2);

        doc.text(rate, 165, yPosition);
        doc.text(amount, 180, yPosition);

        yPosition += rowHeight; // Move yPosition down by row height
    });

    // Calculate and display Total Amount at the end
    const totalAmount = this.data.reduce((sum, item) => sum + (isNaN(Number(item.Amount)) ? 0 : Number(item.Amount)), 0);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: ${totalAmount.toFixed(2)}`, 14, yPosition);

    // Save the PDF
    doc.save('Daily_Detailed_Report.pdf');
}

// Function to add header to each page
// Function to add header to each page

// Function to add header to each page
// Function to add header to each page
addHeader(doc: jsPDF, mainHeading: string, subHeading: string, reportTitle: string, reportDate: string) {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const mainHeadingWidth = doc.getTextWidth(mainHeading);
  doc.text(mainHeading, (doc.internal.pageSize.getWidth() - mainHeadingWidth) / 2, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Address (subHeading) centered
  const subHeadingWidth = doc.getTextWidth(subHeading);
  const availableWidth = doc.internal.pageSize.getWidth() - 20; // Page width minus padding (20px)

  // Ensure the address fits within the available width
  if (subHeadingWidth > availableWidth) {
      let fontSize = 10; // Initial font size
      doc.setFontSize(fontSize);

      // While the text exceeds the available width, reduce the font size
      while (subHeadingWidth > availableWidth && fontSize > 6) {
          fontSize--;
          doc.setFontSize(fontSize);
      }
  }

  // Center the address
  const subHeadingX = (doc.internal.pageSize.getWidth() - subHeadingWidth) / 2;
  doc.text(subHeading, subHeadingX, 22); // 22 is the Y position for address

  doc.setFontSize(12);
  const reportTitleWidth = doc.getTextWidth(reportTitle);
  doc.text(reportTitle, (doc.internal.pageSize.getWidth() - reportTitleWidth) / 2, 30);

  doc.setFontSize(10); // Set font size for date
  const reportDateWidth = doc.getTextWidth(`Date: ${reportDate}`);
  doc.text(`Date: ${reportDate}`, (doc.internal.pageSize.getWidth() - reportDateWidth) / 2, 35); // Align date at center
}




// Function to draw table header
drawTableHeader(doc: jsPDF, yPosition: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold'); // Bold for the table header
    doc.text('RECEIPT NO.', 14, yPosition);
    doc.text('VAZHIPAD', 45, yPosition);
    doc.text('NAME', 90, yPosition); // Adjusted to prevent overlap
    doc.text('STAR', 130, yPosition);
    doc.text('ENNAM', 145, yPosition);
    doc.text('RATE', 165, yPosition);
    doc.text('TOTAL', 180, yPosition);
}

// Helper function to pad zero for date
padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}










}

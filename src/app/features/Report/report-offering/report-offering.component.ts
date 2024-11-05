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

interface ConsolidatedData {
  Vazhipad: string;
  TotalQty: number; // Renamed for clarity
}
@Component({
  selector: 'app-report-offering',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule],
  templateUrl: './report-offering.component.html',
  styleUrl: './report-offering.component.css'
})
export class ReportOfferingComponent {
  displayedColumns: string[] = ['SINo','VAZHIPAD',  'QUANTITY', ];
  dataSource = new MatTableDataSource<ConsolidatedData>();
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 7,10, 20, 50];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};

  consolidatedData: ConsolidatedData[] = [];
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
      Type: "DailyStmt",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
       
      this.consolidateData()
      
        this.dataSource.data = this.consolidatedData
        this.length =this.consolidatedData.length; 
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

  




  consolidateData() {
    this.consolidatedData = this.data.reduce((acc: ConsolidatedData[], current: ReportData) => {
      // Convert Qty to a number if it's a string
      const qty = typeof current.Qty === 'string' ? parseFloat(current.Qty) : current.Qty;

      // Find if the Vazhipad already exists in the accumulator
      const existing = acc.find(item => item.Vazhipad === current.Vazhipad);

      if (existing) {
        // If it exists, add the quantity
        existing.TotalQty += qty; // Use the converted qty
      } else {
        // If it doesn't exist, push a new object with the current Vazhipad and Qty
        acc.push({ Vazhipad: current.Vazhipad, TotalQty: qty }); // Use the converted qty
      }

      return acc;
    }, []);
    this.consolidatedData.sort((a, b) => a.Vazhipad.localeCompare(b.Vazhipad));
    console.log(this.consolidatedData); // Corrected reference to consolidatedData
  }







  generatePDF() {
    const doc = new jsPDF();

    // Main Heading
    const mainHeading = 'MAMMIYOOR DEVASWOM';
    const subHeading = 'Under Malabar Devaswom Board, Guruvayur, Thrissur-680 101.';
    const reportTitle = 'Total Vazhipadu Report';

    // Get current date
    const currentDate = new Date();
    const reportDate = `${this.padZero(currentDate.getDate())}/${this.padZero(currentDate.getMonth() + 1)}/${currentDate.getFullYear()}`;

    // Set initial header
    this.addHeader(doc, mainHeading, subHeading, reportTitle, reportDate);

    // Table Header
    let yPosition = 50; // Adjusted starting y-position for the table headers
    this.drawTableHeader(doc, yPosition);

    // Set font to normal for data rows
    doc.setFont('helvetica', 'normal');
    yPosition += 8; // Move to the next row for data entries

    // Generate the PDF content from consolidatedData
    this.consolidatedData.forEach((item) => {
        // Check for page overflow
        if (yPosition > 280) {
            doc.addPage();
            this.addHeader(doc, mainHeading, subHeading, reportTitle, reportDate); // Add header on new page
            yPosition = 45; // Reset yPosition for new page

            // Redraw table header for new page
            this.drawTableHeader(doc, yPosition);
            yPosition += 8; // Move to next line after header
        }

        // Add row data
        const serialNumber = (this.consolidatedData.indexOf(item) + 1).toString();
        const vazhipadText = item.Vazhipad;
        const qtyText = item.TotalQty.toString();

        // Calculate right alignment for quantity
        const qtyXPosition = 140; // Increased x-position for quantity column to add spacing
        const qtyTextWidth = doc.getTextWidth(qtyText);
        const qtyAlignedX = qtyXPosition - qtyTextWidth; // Right-align based on the column's starting point

        doc.text(serialNumber, 14, yPosition); // Serial Number
        doc.text(vazhipadText, 45, yPosition); // Vazhipad
        doc.text(qtyText, qtyAlignedX, yPosition); // Right-aligned Quantity

        yPosition += 8; // Move to the next row
    });

    // Add footer with underline
    const totalYPosition = yPosition + 10; // Position for total amount
    const totalText = `Total Entries: ${this.consolidatedData.length}`;
    const totalTextWidth = doc.getTextWidth(totalText);
    const rightAlignedX = doc.internal.pageSize.getWidth() - 14 - totalTextWidth; // Right-aligned position

    doc.setFontSize(12);
    doc.text(totalText, rightAlignedX, totalYPosition); // Right-aligned text
    doc.line(14, totalYPosition + 3, 196, totalYPosition + 3); // Draw underline for the footer

    // Save the PDF
    doc.save('offering_vazhipad_Report.pdf');
}

// Function to add header to each page
addHeader(doc: jsPDF, mainHeading: string, subHeading: string, reportTitle: string, reportDate: string) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const mainHeadingWidth = doc.getTextWidth(mainHeading);
    doc.text(mainHeading, (doc.internal.pageSize.getWidth() - mainHeadingWidth) / 2, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const subHeadingWidth = doc.getTextWidth(subHeading);
    doc.text(subHeading, (doc.internal.pageSize.getWidth() - subHeadingWidth) / 2, 22);
    
    doc.setFontSize(12);
    const reportTitleWidth = doc.getTextWidth(reportTitle);
    doc.text(reportTitle, (doc.internal.pageSize.getWidth() - reportTitleWidth) / 2, 30);
    
    doc.setFontSize(10); // Set font size for date
    const reportDateWidth = doc.getTextWidth(`Date: ${reportDate}`);
    doc.text(`Date: ${reportDate}`, (doc.internal.pageSize.getWidth() - reportDateWidth) / 2, 35); // Align date at center

    // Draw underline for header
    doc.line(14, 38, 196, 38); // Draw underline below header
}

// Function to draw table header
drawTableHeader(doc: jsPDF, yPosition: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold'); // Bold for the table header
    doc.text('S.No', 14, yPosition);
    doc.text('VAZHIPAD', 45, yPosition);
    doc.text('QUANTITY', 140, yPosition); // Column header for quantity with adjusted x-position
}

// Utility function to pad numbers with leading zeros
padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}




}

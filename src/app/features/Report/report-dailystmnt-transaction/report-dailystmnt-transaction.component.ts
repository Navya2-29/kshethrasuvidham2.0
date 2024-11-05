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


@Component({
  selector: 'app-report-dailystmnt-transaction',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule],
  templateUrl: './report-dailystmnt-transaction.component.html',
  styleUrl: './report-dailystmnt-transaction.component.css'
})
export class ReportDailystmntTransactionComponent {
  displayedColumns: string[] = ['BillNo','BillDate','Vazhipad', 'Name', 'Star', 'Qty', 'Rate', 'Amount',  'VazhiDate','TrnsMode'];
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
        this.groupDataByTransactionMode(this.data); // Group the data
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

  generatePDF(): void {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height; // Get the height of the page
    const pageWidth = doc.internal.pageSize.width; // Get the width of the page
    const margin = 10; // Set a margin from the edges
    const startY = 30; // Starting vertical position for the header
    const headerHeight = 10; // Height for table headers
    const lineHeight = 5; // Define line height for rows
    const columnWidths = [20, 40, 40, 30, 20, 20, 30]; // Set the widths for each column
    let y = startY; // Current vertical position
    let grandTotal = 0; // Initialize grand total

    // Define the headers here
    const headers = ['Bill No', 'Vazhipad', 'Name', 'Star', 'Qty', 'Rate', 'Vazhi Date'];

    const addPageHeader = (pageNumber: number) => {
        doc.setFontSize(14); // Adjust header font size
        doc.text('Daily Statement Transaction Report', margin, 15); // Title
        doc.setFontSize(10);
        doc.text(`Page ${pageNumber}`, pageWidth - margin - 20, 15); // Page number
        doc.setLineWidth(0.5);
        doc.line(margin, 18, pageWidth - margin, 18); // Underline for header
    };

    const addTableHeader = () => {
        doc.setFontSize(10); // Adjust header font size
        headers.forEach((header, index) => {
            const x = margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
            doc.text(header, x, y);
        });
        y += headerHeight; // Move down for the data rows
    };

    const addFooter = (pageNumber: number) => {
        doc.setFontSize(10); // Footer font size
        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - margin); // Footer
        doc.text(`Page ${pageNumber}`, pageWidth - margin - 20, pageHeight - margin); // Page number on the bottom right
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - margin - 5, pageWidth - margin, pageHeight - margin - 5); // Line above footer
    };

    const wrapText = (text: string, maxWidth: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const testWidth = doc.getTextWidth(testLine);

            if (testWidth > maxWidth && currentLine.length > 0) {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine.trim()); // Add the last line
        return lines;
    };

    let pageNumber = 1; // Track page number
    addPageHeader(pageNumber); // Add header for the first page
    addTableHeader(); // Draw table headers for the first page

    // Loop through grouped data
    Object.keys(this.groupedData).forEach((trnsMode) => {
        let modeTotal = 0; // Initialize total for the current transaction mode

        doc.setFontSize(12); // Adjust font size for the mode title
        doc.text(`Transaction Mode: ${trnsMode}`, margin, y);
        y += lineHeight; // Move down for the data rows

        // Draw underline under the transaction mode
        const lineY = y; // Position for the underline
        doc.setLineWidth(0.5); // Set line width for underline
        doc.line(margin, lineY, pageWidth - margin, lineY); // Draw underline
        y += lineHeight; // Move down for the next header

        // Draw data for each group
        this.groupedData[trnsMode].forEach(item => {
            if (y + lineHeight > pageHeight - margin) { // Check if we need a new page
                addFooter(pageNumber); // Add footer before creating a new page
                doc.addPage(); // Add a new page
                y = startY; // Reset y position for new page
                pageNumber++; // Increment page number

                // Add page header and table header for the new page
                addPageHeader(pageNumber);
                addTableHeader(); // Add table headers on the new page
            }

            // Convert Qty and Rate to numbers for calculations
            const qty = parseFloat(item.Qty) || 0;
            const rate = parseFloat(item.Rate) || 0;

            // Wrap long texts
            const wrappedVazhipad = wrapText(item.Vazhipad, columnWidths[1]); // Wrap Vazhipad
            const wrappedName = wrapText(item.Name, columnWidths[2]); // Wrap Name

            // Adjust y position for multiple lines
            const maxLines = Math.max(wrappedVazhipad.length, wrappedName.length);
            for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
                const xPositions = [
                    margin,
                    margin + columnWidths[0],
                    margin + columnWidths[0] + columnWidths[1],
                    margin + columnWidths[0] + columnWidths[1] + columnWidths[2],
                    margin + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3],
                    margin + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4],
                    margin + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4] + columnWidths[5]
                ];

                // Draw the current line of wrapped text
                const row = [
                    item.BillNo,
                    wrappedVazhipad[lineIndex] || '', // Vazhipad wrapped line
                    wrappedName[lineIndex] || '', // Name wrapped line
                    item.Star,
                    qty.toString(),
                    rate.toString(),
                    item.VazhiDate
                ];

                row.forEach((value, index) => {
                    doc.setFontSize(10); // Set font size for row data
                    doc.text(value, xPositions[index], y);
                });

                y += lineHeight; // Move down for the next line
            }

            // Add to mode total for calculations
            modeTotal += rate * qty; // Assuming you want to calculate a total based on qty and rate
            grandTotal += rate * qty; // Add to grand total

            // Move down for the next row
            y += lineHeight; 
        });

        // Add total for the current transaction mode
        y += lineHeight; // Extra space before the total
        doc.setFontSize(10); // Adjust font size for totals
        doc.text(`Total for ${trnsMode}: ${modeTotal.toFixed(2)}`, margin, y);
        y += lineHeight + 5; // Extra space after the total
    });

    // Add grand total at the end
    if (y + lineHeight > pageHeight - margin) { // Check if we need a new page
        addFooter(pageNumber); // Add footer before creating a new page
        doc.addPage(); // Add a new page
        y = startY; // Reset y position for new page
        pageNumber++; // Increment page number
    }

    doc.setFontSize(12); // Adjust font size for grand total
    doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, margin, y);

    addFooter(pageNumber); // Add footer for the last page

    // Save the PDF
    doc.save('Daily_Statement_Transaction_Report.pdf');
}


















  }


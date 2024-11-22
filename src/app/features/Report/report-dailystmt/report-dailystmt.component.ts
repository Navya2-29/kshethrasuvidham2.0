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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-report-dailystmt',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule],
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
    const templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    const templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const headerHeight = 35;
    const footerHeight = 8;
    const lineHeight = 10;
    const tableHeaderFontSize = 11;
    const contentFontSize = 10;
    const currentDate = new Date().toLocaleDateString();
  
    const maxColumnWidths = [20, 50, 40, 30, 15, 15, 15]; // Column widths for each column
    const headers = ["Bill No.", "VAZHIPAD", "NAME", "STAR", "ENNAM", "RATE", "TOTAL"];
  
    let y = headerHeight;
    let grandTotalRate = 0;
    let grandTotalAmount = 0;
  
    // Draw Header
    const drawHeader = () => {
      doc.setFontSize(12);
      doc.setFont("Helvetica", "bold");
      doc.text(templeName, pageWidth / 2, 12, { align: "center" });
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(templeAddress, pageWidth / 2, 18, { align: "center" });
    
      doc.setFontSize(10);
      doc.setFont("Helvetica", "bold");
      doc.text("DAILY STATEMENT(DETAILED) REPORT", pageWidth / 2, 27, { align: "center" });
    
      // Add current date below the report title but above the table header
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.text(currentDate, pageWidth / 2, 32, { align: "center" });
    
      doc.setLineWidth(0.5);
      doc.line(10, y, pageWidth - 10, y); // Line below header
      y += 3; // Space below the line
    };
  
    // Draw Footer
    const drawFooter = (pageNum: number) => {
      doc.setFontSize(10);
      doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - footerHeight / 2, { align: "center" });
    };
  
    // Add Table Header
    const drawTableHeader = () => {
      doc.setFontSize(tableHeaderFontSize);
      doc.setFont("Helvetica", "bold");
      let x = 10;
      headers.forEach((header, index) => {
        doc.text(header, x, y + 5);
        x += maxColumnWidths[index];
      });
      y += lineHeight;
      doc.setLineWidth(0.3);
      doc.setDrawColor(200, 200, 200); // Light gray color for grid lines
      doc.line(10, y, pageWidth - 10, y); // Line below the table header
      y += 2;
    };
  
    // Helper to Wrap Text
    const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
      const lines = doc.splitTextToSize(text, maxWidth);
      return lines;
    };
  
    // Initialize PDF
    drawHeader();
    drawFooter(1);
    drawTableHeader();
  
    let pageNum = 1;
  
    // Iterate over data and draw rows
    this.data.forEach((row: any) => {
      const tableRow = [
        row.BillNo,
        wrapText(doc, row.Vazhipad, maxColumnWidths[1]), // Wrap Vazhipad
        wrapText(doc, row.Name, maxColumnWidths[2]),     // Wrap Name
        row.Star,
        row.Qty,
        row.Rate.toFixed(2),
        row.Amount.toFixed(2),
      ];
  
      // Calculate the max height required for wrapped text in the row
      const rowHeight = Math.max(...tableRow.map((cell, index) => {
        return Array.isArray(cell) ? cell.length * contentFontSize : lineHeight;
      }));
  
      // Check if a new page is needed
      if (y + rowHeight > pageHeight - footerHeight - 10) {
        doc.addPage();
        pageNum++;
        y = headerHeight + 5;
        drawHeader();
        drawFooter(pageNum);
        drawTableHeader();
      }
  
      let x = 10;
  
      // Draw each cell with normal font
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(contentFontSize);
  
      tableRow.forEach((cell, index) => {
        if (Array.isArray(cell)) {
          // Handle wrapped text
          cell.forEach((line, lineIndex) => {
            doc.text(line, x, y + 5 + (lineIndex * contentFontSize));
          });
        } else {
          if (index === 5 || index === 6) {
            // Align Rate and Total columns to the right
            doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "right" });
          } else {
            // Left-align other columns
            doc.text(String(cell), x, y + 5);
          }
        }
        x += maxColumnWidths[index];
      });
  
      // Draw row grid lines
      doc.setLineWidth(0.3); // Light line width for grid
      doc.setDrawColor(200, 200, 200); // Light gray color
      doc.line(10, y, pageWidth - 10, y); // Line at the bottom of the row
  
      // Accumulate grand totals
      grandTotalRate += row.Rate;
      grandTotalAmount += row.Amount;
  
      y += rowHeight; // Move y position for the next row
    });
  
    // Add Grand Total row
    const grandTotalRow = [
      "",
      "Grand Total", 
      "",
      "", 
      "", 
      "", 
      grandTotalAmount.toFixed(2)
    ];
  
    let x = 10;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(contentFontSize);
    grandTotalRow.forEach((cell, index) => {
      if (index === 5 || index === 6) {
        // Align Rate and Total columns to the right
        doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "right" });
      } else {
        // Left-align other columns
        doc.text(String(cell), x, y + 5);
      }
      x += maxColumnWidths[index];
    });
  
    // Draw grid line after Grand Total
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 200, 200);
    doc.line(10, y, pageWidth - 10, y);
  
    y += lineHeight; // Move y position for the Grand Total row
  
    // Save PDF
    doc.save("DetailedReport.pdf");
}

  
  
  
  









}

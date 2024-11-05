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
  selector: 'app-report-upi',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule],
  templateUrl: './report-upi.component.html',
  styleUrl: './report-upi.component.css'
})
export class ReportUpiComponent {
  displayedColumns: string[] = ['BillNo','Bank Name','Vazhipad', 'Cheq Date', 'ChqueNo',  'Amount',   ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 7,10, 20, 50];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  filteredData:ReportData[]=[];
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
      Type: 'DailyStmt',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
         this.filteredData = this.data.filter(item => item.TrnsMode === 'up');   
         this.filteredData = this.filteredData.sort((a:any, b:any) => {
          const [numA, denomA] = a.BillNo.split('/').map(Number);
          const [numB, denomB] = b.BillNo.split('/').map(Number);
          
          // Compare the two parts: first compare the numerator, then the denominator
          return numA - numB || denomA - denomB;
      });
      console.log(this.filteredData,"aaaaaaaaaaaaaaaaaaa")  

        this.dataSource.data = this.filteredData
        console.log( this.dataSource.data)
        this.length =this.filteredData .length; 
        this.dataSource.paginator = this.paginator;
        
        console.log(this.filteredData);
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

  generatePDF(): void {
    // Filter data for entries with transmode 'ch'
    const filteredData = this.data.filter(item => item.TrnsMode === 'up');
  
    // Initialize jsPDF instance
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const startY = 30;
    const lineHeight = 10; // Increased line height for better spacing
    const columnWidths = [25, 35, 50, 30, 30, 25];
    const headerFontSize = 12;
    const contentFontSize = 10;
    let y = startY;
  
    // Function to add header
    const addHeader = () => {
      doc.setFontSize(headerFontSize);
      doc.text('UPI Transaction Report', margin, 15);
      doc.setLineWidth(0.5);
      doc.line(margin, 18, pageWidth - margin, 18);
    };
  
    // Function to add table header with underline separation
    const addTableHeader = () => {
      const headers = ['Bill No', 'Bank Name', 'Vazhipad', 'Cheq Date', 'Cheque No', 'Amount'];
      doc.setFontSize(contentFontSize);
      headers.forEach((header, index) => {
        doc.text(header, margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), y);
      });
      y += lineHeight; // Move to the next line after header
      doc.line(margin, y - lineHeight / 2, pageWidth - margin, y - lineHeight / 2); // Line below header
      y += 5; // Additional spacing between header line and content
    };
  
    // Function to add footer with pagination
    const addFooter = (pageNumber: number) => {
      doc.setFontSize(contentFontSize);
      doc.text(`Page ${pageNumber}`, pageWidth - margin - 20, pageHeight - margin);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - margin - 5, pageWidth - margin, pageHeight - margin - 5);
    };
  
    addHeader();
    addTableHeader();
  
    let pageNumber = 1;
    let grandTotal = 0;
  
    // Handle case where no data is available for transmode 'ch'
    if (filteredData.length === 0) {
      doc.text('No data available for the selected transaction mode.', margin, y);
      doc.save('Upi_Transaction_Report.pdf');
      return;
    }
  
    // Function to wrap text within a specified width
    const wrapText = (text: string, width: number) => {
      return doc.splitTextToSize(text, width);
    };
  

    // Populate the table with filtered data
    filteredData.forEach(item => {
      // Add a new page if needed
      if (y + lineHeight * 2 > pageHeight - margin) {
        addFooter(pageNumber);
        doc.addPage();
        y = startY;
        pageNumber++;
        addHeader();
        addTableHeader();
      }
  
      const row = [
        item.BillNo || '',
        item.InstBank || '',
        item.Vazhipad || '',
        item.InstDate || '',
        item.InstNo || '',
        (parseFloat(item.Amount) || 0).toFixed(2)
      ];
  
      // Calculate x positions for each column
      const xPositions = [
        margin,
        margin + columnWidths[0],
        margin + columnWidths[0] + columnWidths[1],
        margin + columnWidths[0] + columnWidths[1] + columnWidths[2],
        margin + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3],
        margin + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + columnWidths[4]
      ];
  
      // Add each value in the row with wrapping for long text
      row.forEach((value, index) => {
        const wrappedText = wrapText(value, columnWidths[index] - 5);
        doc.setFontSize(contentFontSize);
        doc.text(wrappedText, xPositions[index], y);
      });
  
      // Move to the next line considering the maximum line height for wrapped text
      y += lineHeight * Math.max(...row.map(value => wrapText(value, columnWidths[2]).length));
      grandTotal += parseFloat(item.Amount) || 0;
    });
  
    // Add grand total at the bottom of the last page
    if (y + lineHeight > pageHeight - margin) {
      addFooter(pageNumber);
      doc.addPage();
      y = startY;
      pageNumber++;
      addHeader();
      addTableHeader();
    }
    
    doc.setFontSize(contentFontSize);
    doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, margin, y + lineHeight);
    addFooter(pageNumber);
  
    // Save the PDF
    doc.save('UPI_Transaction_Report.pdf');
  }

    
}

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

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import puppeteer from 'puppeteer';
@Component({
  selector: 'app-report-checquestmnt',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './report-checquestmnt.component.html',
  styleUrl: './report-checquestmnt.component.css'
})
export class ReportChecquestmntComponent implements OnInit{
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
         this.filteredData = this.data.filter(item => item.TrnsMode === 'ch');   
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
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

 

// Helper method to format date as dd-mm-yyyy
formatDate(dateString: string | undefined): string {
    if (!dateString) return ''; // Return empty string if undefined or empty string
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);  // Ensure two digits
    const month = ("0" + (date.getMonth() + 1)).slice(-2);  // Ensure two digits
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

 generatePDF(): void {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const pageCount = 3; // Specify the number of pages you want in the PDF

  // Function to add the header
  const addHeader = () => {
    doc.setFontSize(16);
    doc.text('Temple Name', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Temple Address Line 1, City, State, ZIP', pageWidth / 2, 20, { align: 'center' });
    
    const currentDate = new Date().toLocaleDateString('en-GB'); // Format: dd-mm-yyyy
    doc.text(`Date: ${currentDate}`, pageWidth / 2, 25, { align: 'center' });
    
    // Underline below header
    doc.setLineWidth(0.5);
    doc.line(15, 28, pageWidth - 15, 28); // Adjust this line position as needed
  };

  // Function to add footer with page number below a line
  const addFooter = (pageNumber: number) => {
    const footerLineY = pageHeight - 20; // Position for footer line
    const pageNumberY = footerLineY + 6; // Position for page number below the line

    // Draw footer line
    doc.setLineWidth(0.5);
    doc.line(15, footerLineY, pageWidth - 15, footerLineY);

    // Add page number text below the line, right-aligned
    doc.setFontSize(10);
    doc.text(`Page ${pageNumber}`, pageWidth - 20, pageNumberY, { align: 'right' });
  };

  // Loop to create the specified number of pages
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    if (pageNumber > 1) doc.addPage(); // Add a new page for each iteration except the first page
    addHeader();
    addFooter(pageNumber);
  }

  // Save or output the PDF
  doc.save('Temple_Report_Empty.pdf');
}






  
  
  
  


}



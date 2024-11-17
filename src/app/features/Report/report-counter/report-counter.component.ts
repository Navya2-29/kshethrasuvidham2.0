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

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-report-counter',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './report-counter.component.html',
  styleUrl: './report-counter.component.css'
})
export class ReportCounterComponent {
  displayedColumns: string[] = ['BillNo', 'InstBank', 'Vazhipad', 'InstDate', 'InstNo', 'Amount'];
    dataSource = new MatTableDataSource<any>();
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 7,10, 20, 50];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  filteredData: any[] = []; 
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
        //  this.filteredData = this.data.filter(item => item.TrnsMode === 'ch');   
         this.data = this.data.sort((a:any, b:any) => {
          const [numA, denomA] = a.BillNo.split('/').map(Number);
          const [numB, denomB] = b.BillNo.split('/').map(Number);
          
          // Compare the two parts: first compare the numerator, then the denominator
          return numA - numB || denomA - denomB;
      });

      this.groupedData = this.groupByCounterID(this.data);
      console.log(this.groupedData,"aaaaaaaaaaaaaaaaaaa")  
      this.filteredData = Object.keys(this.groupedData).map(counterId => ({
        counterId: counterId,
        items: this.groupedData[counterId]
      }));
      
        this.dataSource.data = this.filteredData
        console.log( this.dataSource.data,"hhhhhhhhhhhhhh")
        this.length =this.data .length; 
        this.dataSource.paginator = this.paginator;
        
        console.log(this.filteredData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  groupByCounterID(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce((acc, item) => {
      const counterID = item.CounterId;
      if (!acc[counterID]) {
        acc[counterID] = []; // Initialize array if it doesn't exist
      }
      acc[counterID].push(item);
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
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
//  this.filteredData[counterId].filter = filterValue.trim().toLowerCase();
this.filteredData = Object.keys(this.groupedData).map(counterId => ({
  counterId: counterId,
  items: this.groupedData[counterId].filter(item =>
    item.BillNo.toLowerCase().includes(filterValue) ||
    // item.InstBank.toLowerCase().includes(filterValue) ||
    item.Vazhipad.toLowerCase().includes(filterValue)
  )
}));

this.dataSource.data = this.filteredData; 
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
  let yOffset = 20; // Initial vertical position

  // Iterate over the filteredData (grouped by CounterId)
  this.filteredData.forEach((group, groupIndex) => {
    // Set the title for each group (CounterId)
    doc.setFontSize(16);
    doc.text(`Counter: ${group.counterId}`, 10, yOffset);
    yOffset += 10;

    // Table Header
    doc.setFontSize(12);
    doc.text('Bill No', 10, yOffset);
    doc.text('Bank Name', 40, yOffset);
    doc.text('Vazhipad', 80, yOffset);
    doc.text('Cheque Date', 120, yOffset);
    doc.text('Cheque No', 160, yOffset);
    doc.text('Amount', 200, yOffset);

    yOffset += 10;

    // Add the data for the current counterId
    group.items.forEach((item:any) => {
      doc.text(item.BillNo, 10, yOffset);
      doc.text(item.InstBank, 40, yOffset);
      doc.text(item.Vazhipad, 80, yOffset);
      doc.text(item.InstDate, 120, yOffset);
      doc.text(item.InstNo, 160, yOffset);
      doc.text(item.Amount.toString(), 200, yOffset);
      yOffset += 10;

      // Add a page break if we are near the bottom of the page
      if (yOffset > 250) {
        doc.addPage();
        yOffset = 20; // Reset yOffset for the new page
      }
    });

    // Add page break after each group if necessary
    if (groupIndex < this.filteredData.length - 1) {
      doc.addPage();
      yOffset = 20; // Reset yOffset for the new page
    }
  });

  doc.save('daily_statement_report.pdf'); // Download the PDF
}











  
  
  
}

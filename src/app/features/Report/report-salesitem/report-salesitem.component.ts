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
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FeeCollection } from '../../../models/feecollection.model';
@Component({
  selector: 'app-report-salesitem',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,MatFormFieldModule, MatInputModule,TranslateModule

  ],
  templateUrl: './report-salesitem.component.html',
  styleUrl: './report-salesitem.component.css'
})
export class ReportSalesitemComponent {

  
  displayedColumns: string[] = ['BillNo','BillDate','NM_Name', 'Name', 'Star', 'Qty', 'ItemValue','weight', 'Receipt_Amt',  'TrnMode','Remarks' ];
  dataSource = new MatTableDataSource<FeeCollection>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data: FeeCollection[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: FeeCollection[] } = {};
  currentDate: string = '';
  currentPage: number = 1;
  fromDate:string;
  toDate:string;
  groupedDatas: { [key: string]: any[] } = {};
lang:string|null;
templeName:string|null;
templeAddress:string|null;
  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http:HttpClient,
    private ts: TranslateService
  ) {
this.lang=localStorage.getItem('Language');
this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');

  }

  genearatePDF(){
    const printContent = document.getElementById('print-section');
  if (!printContent) {
    console.error('No content found to print');
    return;
  }

  const WindowPrt = window.open('', '', 'width=800,height=600');
  
  // Check if the print window was successfully opened
  if (!WindowPrt) {
    console.error('Unable to open print window. Please check pop-up blockers.');
    return;
  }

  WindowPrt.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          /* Add custom styles for printing if needed */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 5px;
            text-align: left;
          }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
    </html>
  `);

  WindowPrt.document.close();
  WindowPrt.focus();

  // Make sure that the window is still valid before calling print and close
  if (WindowPrt) {
    WindowPrt.print();
    WindowPrt.close();
  } 
  }
  


  groupDataByName(data: FeeCollection[]): { [key: string]: FeeCollection[] } {
    return data.reduce((acc:any, item:any) => {
      if (!acc[item.Vazhipad]) {
        acc[item.Vazhipad] = [];
      }
      acc[item.Vazhipad].push(item);
      return acc;
    }, {} as { [key: string]: FeeCollection[] });
  }
  



  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this. fromDate = params['fromDate'];
      this. toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    const payLoad = {
      Type: "SalesRpt",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
        // this.groupDataByTransactionMode(this.data); // Group the data
        this.groupedData = this.groupDataByName(this.data);
        this.dataSource.data = this.data;
        
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
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

  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  generatePDF(){
    const printContent = document.getElementById('print-section');
    if (!printContent) {
      console.error('No content found to print');
      return;
    }
  
    const WindowPrt = window.open('', '', 'width=800,height=600');
    
    // Check if the print window was successfully opened
    if (!WindowPrt) {
      console.error('Unable to open print window. Please check pop-up blockers.');
      return;
    }
  
    WindowPrt.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            /* Add custom styles for printing if needed */
            table {
              width: 100%;
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid black;
            }
            th, td {
              padding: 5px;
              text-align: left;
            }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
  
    WindowPrt.document.close();
    WindowPrt.focus();
  
    // Make sure that the window is still valid before calling print and close
    if (WindowPrt) {
      WindowPrt.print();
      WindowPrt.close();
    } 
}


getTotalAmount(): number {
  return this.data.reduce((sum, item) => sum + item.Amount, 0);
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


  
 // Calculate the grand total for each transaction mode
 getGrandTotalForTrnsMode(item: string): any {
  const items = this.groupedData[item]; // Get items for the transaction mode
  if (!items || items.length === 0) {
    return 0; // No items found, return 0
  }
// Calculate the total
const total = items.reduce((sum, item) => {
 // Default to 0 if Rate is missing
  return sum +item. Amount;
}, 0);

return total;

}





}

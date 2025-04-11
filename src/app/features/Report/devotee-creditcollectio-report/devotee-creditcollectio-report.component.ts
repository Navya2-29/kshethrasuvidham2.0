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
import { HttpClient } from '@angular/common/http';
import { ReportDailyStmt } from '../../../models/dailytrasaction.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MembersReport } from '../../../models/members.model';
import { PrintreportService } from '../../../shared/service/printreport.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
@Component({
  selector: 'app-devotee-creditcollectio-report',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    HeaderComponent,
    MatTooltipModule,MatFormFieldModule,TranslateModule, MatInputModule,SpinnerComponent
  ],
  templateUrl: './devotee-creditcollectio-report.component.html',
  styleUrls: ['./devotee-creditcollectio-report.component.css','/src/assets/styles/report.style.css'],
})
export class DevoteeCreditcollectioReportComponent {

  displayedColumns: string[] = [
    'BillNo',
    'BillDate',
    "Counter",
    'Vazhipad',
    'Name',
    'Star',
    'Qty',
    'Rate',
    'Amount',
    'VazhiDate',
    'TrnsMode',
  ];
  dataSource = new MatTableDataSource<ReportDailyStmt>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data: MembersReport[] = [];
  fromDate:string;
  toDate:string;
loading:boolean;
  currentDate: string = '';
  allCreditdata:ReportData[]=[];
  counterId:string | null;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;

  constructor(
    private route: ActivatedRoute,
    private service: ReportService,
    private router: Router,
    private http:HttpClient,
    private ts: TranslateService,
    private reportPrintservice:PrintreportService
    
  ) {
    this.counterId=localStorage.getItem('Counter')
    this.lang=localStorage.getItem('Language');
this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
const userLang = navigator.language || 'en';
const languageCode = userLang.split('-')[0];
this.ts.setDefaultLang(languageCode);
this.ts.use(this.lang || 'en');

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
       this.fromDate = params['fromDate'];
       this.toDate = params['toDate'];
       this.fetchAllCreditReportData( this.fromDate, this.toDate);

      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }
  // getTotalAmount(): number {
  //   return this.data.reduce((sum, item) => sum + item.Amount, 0);
  // }
  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: "DevotteCreditCollect",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
       this.loading=false;
        this.length = data.length;
       
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }


  fetchAllCreditReportData( fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: 'CreditCollect',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.allCreditdata=data;
        this.loading=false;
        //  this.filteredData = this.filteredData.sort((a:any, b:any) => {
        //   const [numA, denomA] = a.BillNo.split('/').map(Number);
        //   const [numB, denomB] = b.BillNo.split('/').map(Number);
          
        //   // Compare the two parts: first compare the numerator, then the denominator
        //   return numA - numB || denomA - denomB;
      // });
      

        
       
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }


  fetchmembercreitReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: "DevottePendingCreditCollect",
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
       this.loading=false;
        this.length = data.length;
       
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }


  getTotalAmount(): number {
    return this.allCreditdata.reduce((sum, item) => sum + item.Amount, 0);
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


  

  getTransactionType(transmode: any): string {
    switch (transmode) {
      case 'ON':
        return 'BANK';
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

  getGrandTotal(): number {
    return this.data.reduce((sum, item) => sum + Number(item.Amount), 0);
  }




  generatePDF(){
    this.reportPrintservice.generatePDF();
//     const printContent = document.getElementById('print-section');
//     if (!printContent) {
//       console.error('No content found to print');
//       return;
//     }
  
//     const WindowPrt = window.open('', '', 'width=800,height=600');
    
//     // Check if the print window was successfully opened
//     if (!WindowPrt) {
//       console.error('Unable to open print window. Please check pop-up blockers.');
//       return;
//     }
  
//     WindowPrt.document.write(`
//       <html>
//         <head>
//           <title>Print</title>
//          <style>
         
//           body {
//     font-size: 16px;
//     font-family: "Times New Roman", serif;
//   }
//           h3,p,h4,h2{
//           line-height:1;
//           margin-top:0;
//           text-align:center;
//           }
//           .templename{
//            line-height:1;
//           margin-top:0;
//           text-align:center;
//           }
//           hr{
//           height:2px;
//           }
//           .tabble-heading h3{
//   font-family: 'Times New Roman', Times, serif;
//   font-weight: bold;
//   font-size: 16px;
//   margin: 8px 0 0 0;
// }
//           table {
//             width: 100%;
//             border-collapse: collapse;
//           }
//           table, th, td {
//             border: 1px solid black;
//             text-transform: uppercase;

//           }
//             .total,number{
//             text-align:right;
//             }
//           th, td {
//            padding-left:5px;
//             text-align: left;
//           }
//             .grandtotal{
//             text-align:right;
//             }
//             #print-section{
//          padding-bottom: 100px;
//   }
       
    
//     .page-break {
//       page-break-before: always;
//     }
//           </style>
//         </head>
//         <body>${printContent.innerHTML}</body>
//       </html>
//     `);
  
//     WindowPrt.document.close();
//     WindowPrt.focus();
  
//     if (WindowPrt) {
//       WindowPrt.print();
//       WindowPrt.close();
//     }

    }

}

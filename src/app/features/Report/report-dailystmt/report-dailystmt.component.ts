import { SpinnerComponent } from './../../../shared/component/spinner/spinner.component';
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
// import { jsPDF } from 'jspdf';
import { ReportData } from '../../../models/poornam-report';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Location } from '@angular/common';
import autoTable from 'jspdf-autotable';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { MasterService } from '../../../services/master/master.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PrintreportService } from '../../../shared/service/printreport.service';
@Component({
  selector: 'app-report-dailystmt',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    TranslateModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    SpinnerComponent
  ],
  templateUrl: './report-dailystmt.component.html',
  styleUrls: ['./report-dailystmt.component.css','/src/assets/styles/report.style.css'],
})
export class ReportDailystmtComponent {
  
  
  data: ReportData[] = [];
  groupedData: { [key: string]: ReportData[] } = {};
  nakshatham: any[];
  lang: string | null;
  fromDate: string;
  toDate: string;
  templeName: string | null;
  templeAddress: string | null;
  loading:boolean;
  constructor(
    private route: ActivatedRoute,
    private ts: TranslateService,
    private masterService: MasterService,
    private service: ReportService,
    private router: Router,
    private reportPrintservice:PrintreportService
    
  ) {
    this.loadStarData();
    this.lang = localStorage.getItem('Language');

    // this.lang=localStorage.getItem('Language');
    this.templeName =
      localStorage.getItem('TempleName') || 'Default Temple Name';
    this.templeAddress =
      localStorage.getItem('Address') || 'Default Temple Address';
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
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

  
  // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    this.loading=true;
    const payLoad = {
      Type: type,
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data = data;
this.loading=false;
      

        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  // onPageChange(event: PageEvent) {
  //   this.pageIndex = event.pageIndex;
  //   this.pageSize = event.pageSize;
  // }

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
  
  getGrandTotal(): number {
    return this.data.reduce((sum, item) => sum + item.Qty * item.Rate, 0);
  }

  generatePDF() {
this.reportPrintservice.generatePDF();
// this.reportPrintservice.generatePDF()
//     const printContent = document.getElementById('print-section');
//     if (!printContent) {
//       console.error('No content found to print');
//       return;
//     }

//     const WindowPrt = window.open('', '', 'width=800,height=600');

//     // Check if the print window was successfully opened
//     if (!WindowPrt) {
//       console.error(
//         'Unable to open print window. Please check pop-up blockers.'
//       );
//       return;
//     }

//     WindowPrt.document.write(`
//     <html>
//       <head>
//         <title>Print</title>
//         <style>
         
//           body {
//     font-size: 10px;
//     font-family: "Manjari";
//     margin:5px;
//   }
//           h3,p,h4,h2{
//           line-height:1;
//           margin-top:0;
//           text-align:center;
//           font-family: "Roboto";
//           font-size:12px;
//           margin-bottom:0px;
//           }
//           .templename{
//            line-height:1;
//           margin-top:0;
//           text-align:center;
//           font-family: "Manjari";
//           font-size:12px;
//           }
//           hr{
//           height:2px;
//           }
//           .number,.total{
//             text-align:right;
//             }
//           .tabble-heading h3{
//   font-family: "Manjari;
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
//             font-family: "Manjari";
//           font-size:12px;

//           }
//             .total,number{
//             text-align:right;
//             font-family: "Manjari";
//           font-size:12px;
//             }
//           th, td {
//            padding-left:5px;
//             text-align: left;
//              font-family: "Manjari";
//           font-size:10px;
//           border:1px solid gray;
//           }
//             #print-section{
// padding-bottom: 100px;
//   }
       
    
//     .page-break {
//       page-break-before: always;
//     }
//           </style>
//       </head>
//       <body>${printContent.innerHTML}</body>
//     </html>
//   `);

//     WindowPrt.document.close();
//     WindowPrt.focus();

//     if (WindowPrt) {
//       WindowPrt.print();
//       WindowPrt.close();
//     }
  }


  generatePDFs() {
    const element = document.getElementById('print-section'); 
  
    if (!element) {
      console.error("Element not found");
      return;
    }
  
    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width; 
  
      pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
      pdf.save('Poornam_Report.pdf'); 
    }).catch(error => {
      console.error("Error generating PDF:", error);
    });
  }
  getStarbyId(id: string) {
    console.log(id, 'star id');
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_NameEng : '';
    } else if (this.lang == 'ml') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_Name : '';
    }
  }

  loadStarData(): void {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterService.getStarData(payLoad).subscribe({
      next: (data: any[]) => {
        console.log(data);
        this.nakshatham = data; 

      },
      error: (err) => {
        console.error('Error loading star data:', err);
      },
    });
  }
}

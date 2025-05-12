import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
// import { ReportData } from '../../../models/poornam-report';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { PrintreportService } from '../../../shared/service/printreport.service';
interface ReportData {
  VTime: number;
  Vazhipad: string;
  Prathista: string;
  Name: string;
  Star: string;
  Qty: number;
  Address1: string;
  Address2: string;
  MobileNo: string;
  // ...other fields
}
@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    MatTableModule,
    MatPaginatorModule,
    TranslateModule,
    HeaderComponent,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './report-view.component.html',
  styleUrls: [
    './report-view.component.css',
    '/src/assets/styles/report.style.css',
  ],
})
export class ReportViewComponent implements OnInit {
  loading: boolean;
  data: ReportData[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [vtime: string]: { [vazhipadPrathista: string]: ReportData[] } } = {};  fromDate: string;
  toDate: string;
  lang: string | null;
  templeName: string | null;
  templeAddress: string | null;
  constructor(
    private route: ActivatedRoute,
    private ts: TranslateService,
    private service: ReportService,
    private router: Router,
    private http: HttpClient,
    private reportPrintservice: PrintreportService
  ) {
    this.lang = localStorage.getItem('Language');
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
        //   this.data = data.sort((a:any, b:any) => {
        //     const [numA, denomA] = a.BillNo.split('/').map(Number);
        //     const [numB, denomB] = b.BillNo.split('/').map(Number);

        //     // Compare the two parts: first compare the numerator, then the denominator
        //     return numA - numB || denomA - denomB;
        // });

        // this.groupedData = this.groupByVazhipad(data);
        const groupedByVtime = this.groupByVtime(data);
      
        // Then group by Vazhipad and Prathista within each vtime group
        this.groupedData = this.groupByVazhipadAndPrathista(groupedByVtime);

        this.loading=false;
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  groupByVazhipad(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce((acc, current) => {
      const key = `${current.Vazhipad}-${current.Prathista}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(current);
      return acc;
    }, {} as { [key: string]: ReportData[] });
  }

  groupByVtime(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce((acc, current) => {
      const key = current.VTime; // Assuming vtime is the field you want to group by
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(current);
      return acc;
    }, {} as { [key: string]: ReportData[] });
  }

  groupByVazhipadAndPrathista(
    groupedByVtime: { [vtime: string]: ReportData[] }
  ): { [vtime: string]: { [vazhipadKey: string]: ReportData[] } } {
    const result: { [vtime: string]: { [vazhipadKey: string]: ReportData[] } } = {};
  
    for (const vtimeKey in groupedByVtime) {
      if (groupedByVtime.hasOwnProperty(vtimeKey)) {
        const items = groupedByVtime[vtimeKey];
        result[vtimeKey] = items.reduce(
          (acc: { [vazhipadKey: string]: ReportData[] }, current) => {
            const key = `${current.Vazhipad}-${current.Prathista}`;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(current);
            return acc;
          },
          {}
        );
      }
    }
  
    return result;
  }
  
  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  

  goBack(): void {
    console.log('Going back...'); // Log to verify method execution
    this.router.navigate(['/getReport']);

    if (window.history.length > 1) {
      window.history.back(); // Goes back to the previous page in history
    } else {
      window.close();
    }
  }

  getTimeForBill(time:any){    
    switch (time.toString()) {
      case '0':
        if (this.lang =='en') {
          return 'Any Time';
        } else {
          return 'എപ്പോൾ വേണമെങ്കിലും';
        }
  
      case '1':
        if (this.lang == 'en') {
          return 'Morning';
        } else {
          return 'രാവിലെ';
        }
      case '2':
        if (this.lang == 'en') {
          return 'Evening';
        } else {
          return 'വൈകുന്നേരം';
        }
      case '3':
        if (this.lang == 'en') {
          return 'Night';
        } else {
          return 'രാത്രി';
        }
      default:
        return 'OTHERS';
    }
      
  }


  generatePDF() {
   this.reportPrintservice.generatePDF();
  }
}

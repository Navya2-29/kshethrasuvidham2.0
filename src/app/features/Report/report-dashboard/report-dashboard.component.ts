import { ReportService } from './../service/report.service';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';

interface Transaction {
  Vazhipad: string;
  Qty: string;
  Amount: string;
  Rate: string;
}

interface DataItem {
  BillNo: string;
  Name: string;
  Star: string;
  Qty: string;
  VazhiDate: string;
  Amount: string;
  Vazhipad: string;
}

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    SpinnerComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './report-dashboard.component.html',
  styleUrl: './report-dashboard.component.css',
  providers: [DatePipe],
})
export class ReportDashboardComponent {
  searchForm: FormGroup;
  isloading: boolean = false;
  isSearchPerformed: boolean = false;
  newTab: any;
  today:Date=new Date()
  isChecked:boolean;
  pmaster:any[]=[];
  Vmaster:any[]=[];
  constructor(
    private fb: FormBuilder,
    private service: ReportService,
    private router: Router,
    private masterService:MasterService
  ) {
    console.log(this.today)
    this.searchForm = this.fb.group({
      vazhipadOption: ['Poornam'],
      fromDate: [this.formatDate(this.today)],
      toDate: [this.formatDate(this.today)],
      countercheckbox:[false],
      prathista:[''],
      vazhipad:['']
    });
    console.log( this.searchForm.value.countercheckbox," ")
  }

  // searchcall
  onSearch() {
    this.isloading = true;
    const searchParams = this.searchForm.value;
    const reportType = searchParams.vazhipadOption;
    const vazhipad =searchParams.vazhipad;
    const prathista=searchParams.prathista
    const fromDateFormatted = this.formatDate(searchParams.fromDate);
    const toDateFormatted = this.formatDate(searchParams.toDate);
    this.isChecked=searchParams.countercheckbox; 
    const payLoad = {
      Type: searchParams.vazhipadOption,
      FromDate: fromDateFormatted,
      ToDate: toDateFormatted,
    };
    
    // const queryString = `?type=${encodeURIComponent(
    //   payLoad.Type
    // )}&fromDate=${encodeURIComponent(
    //   payLoad.FromDate
    // )}&toDate=${encodeURIComponent(payLoad.ToDate)}`;
if(prathista || vazhipad){
  const queryString = `?Prathishta=${encodeURIComponent(
    prathista
  )}&Vazhipad=${encodeURIComponent(
    vazhipad
  )}
  &fromDate=${encodeURIComponent(
    payLoad.FromDate
  )}&toDate=${encodeURIComponent(payLoad.ToDate)}`;
   this.getVazhipadwisereprt(queryString)
}else{
  const queryString = `?type=${encodeURIComponent(
    payLoad.Type
  )}&fromDate=${encodeURIComponent(
    payLoad.FromDate
  )}&toDate=${encodeURIComponent(payLoad.ToDate)}`;


    if (reportType === 'Poornam') {
      this.newTab = window.open(`#/report-viewer${queryString}`, '_blank');
    } else if (reportType === 'DailyStmtDetaild') {
      this.newTab = window.open(`#/report-dailystmnt${queryString}`, '_blank');
    } else if (reportType === 'cheque') {
      this.newTab = window.open(`#/report-cheque${queryString}`, '_blank');
    } else if (reportType === 'DailyStmt') {
      this.newTab = window.open(`#/report-transaction${queryString}`, '_blank');
    }
    else if (reportType === 'report-counter-trnsaction') {
      this.newTab = window.open(`#/report-counter-trnsaction${queryString}`, '_blank');
    }
    else if (reportType === 'searching') {
      this.newTab = window.open(`#/report-transaction${queryString}`, '_blank');
    }
    else if (reportType === 'AdvanceBook') {
      this.newTab = window.open(`#/report-AdvanceBook${queryString}`, '_blank');
    }
    else if (reportType === 'upi') {
      this.newTab = window.open(`#/report-upi${queryString}`, '_blank');
    }
    else if (reportType === 'offering') {
      this.newTab = window.open(`#/report-offering${queryString}`, '_blank');
    }
    else if (reportType === 'credit') {
      this.newTab = window.open(`#/report-credit${queryString}`, '_blank');
    }
   
    else if (reportType === 'counter' && this.isChecked===true) {
      this.newTab = window.open(`#/report-counter${queryString}`, '_blank');
    }
    else if (reportType === 'counter') {
      this.newTab = window.open(`#/report-counter-self${queryString}`, '_blank');
    }

    else if (reportType === 'cancel') {
      this.newTab = window.open(`#/report-cancel${queryString}`, '_blank');
    }
    else if (reportType === 'nadavaravu') {
      this.newTab = window.open(`#/report-nadavaravu${queryString}`, '_blank');
    }
    else if (reportType === 'debit') {
      this.newTab = window.open(`#/report-debit${queryString}`, '_blank');
    }
    else if (reportType === 'nadavaravu-cancel') {
      this.newTab = window.open(`#/report-nadavaravu-cancel${queryString}`, '_blank');
    }
    else if (reportType === 'moneyorder') {
      this.newTab = window.open(`#/report-moneyorder${queryString}`, '_blank');
    }
    else if (reportType === 'online') {
      this.newTab = window.open(`#/report-online${queryString}`, '_blank');
    }
  }

    if (this.newTab) {
      this.newTab.focus();
      this.isloading = false;
    }
  }
  
  getVazhipadwisereprt(queryString:any){
     if(queryString){
      this.newTab = window.open(`#/vazhipadwise${queryString}`, '_blank');
    }
  }
  // format date as the dd/mm/yyyy
  formatDate(dateString: any): string {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
  onBack(){
    this.router.navigate(['/dashboard'])
  }
ngOnInit(){
this.getPrathistaList();
this.getVazhipadList()

}
getPrathistaList(){
  this.masterService.getPmaster().subscribe({
    next: (data) => {
      if (data && data.length > 0) {
        this.pmaster = data;
        
       
        console.log(this.pmaster);
      }
    },
    error: (error) => {
      console.log(error);
      // this.loading = true;
    },
  });
}

getVazhipadList(){
  this.masterService.getVmaster().subscribe({
    next: (data) => {
      if (data && data.length > 0) {
        console.log(data);
        this.Vmaster = data;
        console.log(this.Vmaster,"data");
       
      }
    },
    error: (error) => {
      // this.notification.showSuccess('Try after some Time');
    },
  });
}

}

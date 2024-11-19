import { ReportService } from './../service/report.service';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
  
  constructor(
    private fb: FormBuilder,
    private service: ReportService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      vazhipadOption: ['Poornam'],
      fromDate: [''],
      toDate: [''],
    });
  }

  // searchcall
  onSearch() {
    this.isloading = true;
    const searchParams = this.searchForm.value;
    const reportType = searchParams.vazhipadOption;
    const fromDateFormatted = this.formatDate(searchParams.fromDate);
    const toDateFormatted = this.formatDate(searchParams.toDate);
    const payLoad = {
      Type: searchParams.vazhipadOption,
      FromDate: fromDateFormatted,
      ToDate: toDateFormatted,
    };
    console.log(payLoad);
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
    else if (reportType === 'counter') {
      this.newTab = window.open(`#/report-counter${queryString}`, '_blank');
    }
    else if (reportType === 'cancel') {
      this.newTab = window.open(`#/report-cancel${queryString}`, '_blank');
    }

    if (this.newTab) {
      this.newTab.focus();
      this.isloading = false;
    }
  }
  
  // format date as the dd/mm/yyyy
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  

}

import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MorebuttonComponent } from '../morebutton/morebutton.component';
import { MasterService } from '../services/master/master.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CancelBillRemarkComponent } from '../features/Billing/cancel-bill-remark/cancel-bill-remark.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { NumberToWordsPipe } from '../shared/pipe/number-to-words.pipe';
@Component({
  selector: 'app-creditcollection',
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    
    FormsModule,
    ReactiveFormsModule,
    CommonModule,TranslateModule,
    NumberToWordsPipe
  ],
  templateUrl: './creditcollection.component.html',
  styleUrl: './creditcollection.component.css',
})
export class CreditcollectionComponent {
  CreditForm: FormGroup;
  creditCollectionData: any[] = [];
  userId: string | null;
  role: string | null;
  CounterId: string | null;
  nakshatham: any[];
  currentDate: string;
  lastBillnumber: number;
  currentBillNumber: string;
  theLastBillNo: string;
  name: string | null;
  fnameCtrl = new FormControl('');
  totalAmount: string;
  filteredData: any[] = [];
  searchForm: FormGroup;
  today: Date = new Date();
  cancellationReason: string;
  cancelBillNumber: string;
  lang:string |null;
  printerLayOut:string |null;
  templeName: string | null = '';
  templeAddress: string | null = '';
  // todayBillDate: Date = new Date();
  constructor(
    private service: MasterService,
    private fb: FormBuilder,
    private notification: ToastrService,
    private router: Router,
    private dialog: MatDialog,
    private ts: TranslateService
  ) {
    this.lang=localStorage.getItem('Language')
    this.templeName = localStorage.getItem('TempleName');
    this.templeAddress = localStorage.getItem('Address');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.userId = localStorage.getItem('LoginId');
    this.role = localStorage.getItem('Role');
    this.CounterId = localStorage.getItem('counterId');
    this.printerLayOut=localStorage.getItem('Printer');
    this.name=localStorage.getItem('name');

    this.CreditForm = this.fb.group({
      BillNo: ['', [Validators.required]],
      Name: ['', [Validators.required]],
      Mobile: [''],
      Address: [''],

      TrnsMode: ['CS'],
      RefNo: ['', [Validators.required]],
      Amount: ['', [Validators.required]],
      Remarks: [''],
      UserId: [this.userId],
      CounterId: [this.CounterId],
    });
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      searchBillDate: [''],
      searchBillNo: ['']
    });
    this.currentDate = this.getCurrentDateMMYY();
    this.getBillNumber();
    this.instanoValidation();

    this.getCreditCollection();
  }


  onSearchByBillDate(): void {
    const searchBillDate = this.searchForm.value.searchBillDate;
    // console.log('Search Bill Date:', searchBillDate);
  
    if (searchBillDate) {
      const formattedSearchDate = new Date(searchBillDate).toLocaleDateString('en-GB'); // Formats to dd/mm/yyyy
  
      this.filteredData = this.creditCollectionData.filter((item) => {
        const itemBillDate = new Date(item.BillDate).toLocaleDateString('en-GB'); // Formats the API date to dd/mm/yyyy
        // console.log('Comparing dates:', itemBillDate, formattedSearchDate);
  
        // Compare only the date part (ignores the time part)
        return itemBillDate === formattedSearchDate;
      });
    } else {
      // If no date is entered, reset the filtered data
      this.filteredData = this.creditCollectionData;
    }
  }

  onSearchByBillNumber(): void {
    const searchBillNumber = this.searchForm.value.searchBillNo;
    // console.log(searchBillNumber);

    this.filteredData = this.creditCollectionData.filter((item) => {
      return searchBillNumber
        ? item.BillNo && item.BillNo.includes(searchBillNumber) // Ensure BillNo exists and is a string
        : true;
    });
  }

  
  resetSearch(): void {
    this.searchForm.reset();
    this.filteredData = [...this.creditCollectionData];
    
  }


  instanoValidation(){
    this.CreditForm.get('TrnsMode')?.valueChanges.subscribe((mode) => {
      const instNoControl = this.CreditForm.get('Remarks');
      // console.log(mode)
      if (mode === 'UP') {
        // Make InstNo mandatory
        instNoControl?.setValidators([Validators.required]);
      } else {
        // Remove mandatory validation
        instNoControl?.clearValidators();
      }
      // Re-evaluate the validity of the field
      instNoControl?.updateValueAndValidity();
    });
  }


  
  getCreditCollection() {
    const payLoad = { Type: 'ListCreditCollection', Code: '' };
    this.service.getNadavaravBillNumber(payLoad).subscribe((data) => {
      this.creditCollectionData = data;
      this.filteredData = [...this.creditCollectionData];
      // console.log(this.creditCollectionData);
    });
  }

  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }
  getBillNumber() {
    const payLoad = {
      Type: 'MaxBillnoCredit',
      code: '',
    };
    this.service.getNadavaravBillNumber(payLoad).subscribe({
      next: (data) => {
        // console.log(data);

        // console.log(data[0].billno);
        this.lastBillnumber = data[0].billno;
        this.theLastBillNo =
          'CR' + this.lastBillnumber.toString() + '/' + this.currentDate;
        // console.log(this.theLastBillNo);
        this.currentBillNumber =
          (this.lastBillnumber + 1).toString() + '/' + this.currentDate;
        // console.log(this.currentBillNumber);
        this.CreditForm.patchValue({
          BillNo: this.theLastBillNo,
        });
      },
    });
  }

  onSubmit() {
    if (this.CreditForm.valid) {
      const payLoad = {
        BillNo: this.CreditForm.value.BillNo,
        RefNo: this.CreditForm.value.RefNo,
        Amount: this.CreditForm.value.Amount,
        TrnsMode: this.CreditForm.value.TrnsMode,
        UserId: this.userId,
        CounterId: this.CounterId,
        Remarks: this.CreditForm.value.Remarks,
      };
  
      this.service.createCreditCollection(payLoad).subscribe((data) => {
        // console.log(data);
        if (data.RespStatus === 'I') {
          this.getCreditCollection();
          
          this.notification.success(data.RespMsg);
          const currentBillnumber = this.lastBillnumber + 1;
          // console.log(currentBillnumber, '_1');
          this.service.updatecreditBillNumber(currentBillnumber).subscribe({
            next: (data) => {
              // console.log(data, 'update');
              this.printCreditCollection();
              this.getBillNumber();
              this.getCreditCollection();
              this.Reset();
            },
            error: (err) => {},
          });
        }
      });
    }else{
      this.notification.error('Please click corresponding user edit button on the table before proceed.', 'Credit Collection');
      this.CreditForm.markAllAsTouched();
    }
  }

  Reset() {
    this.CreditForm.reset({
      BillNo: '',
      Name: '',
      Mobile: '',
      Address: '',
      
      TrnsMode: 'CS',
      RefNo: '',
      Amount: '',
      Remarks: '',
      UserId: this.userId,
      CounterId: this.CounterId,
    });
    this.totalAmount='';
  }

  onEdit(data: any) {
    // console.log(data, 'edit');
    this.totalAmount = data.Amount;
    this.CreditForm.patchValue({
      Name: data.Name,
      Mobile: data.MobileNo,
      Address: [data.Address1, data.Address2, data.Address3, data.PinCode],
      Amount: data.Amount,
      TrnsMode: 'CS',
      RefNo: data.BillNo,
    });
  }

  cancellTheBill(billnumber: string) {
    this.cancelBillNumber = billnumber;
    this.openCancelRemarkDialog();
  }


  OnCancelSubmit() {
    const payLoad = {
      Type: 'Nadavaravu',
      BillNo: this.cancelBillNumber,
      CancelBy: this.userId,
      Remarks: this.cancellationReason,
    };
    this.service.cancellBill(payLoad).subscribe((data) => {
      // console.log(data);
    });
  }


  openCancelRemarkDialog() {
    const remarkDialogRef = this.dialog.open(CancelBillRemarkComponent, {
      width: '400px',
      data: { reason: this.cancellationReason }, // You can pass data to the new component here
    });

    remarkDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cancellationReason = result; // Update the cancellationReason with the value from the dialog
        // console.log('Updated Cancellation Reason:', this.cancellationReason);
        this.OnCancelSubmit();
      } else {
        // console.log('Dialog was closed without submitting the reason.');
      }
    });
  }

printCreditCollection(){

  if(this.printerLayOut=="laser"){
    this.printReciept();
  }else if(this.printerLayOut=="inkJet"){
    this.printReciept();
  }
  else if(this.printerLayOut=="thermal"){
    this.printThermlRecipt();
  }
  else if(this.printerLayOut=="dotMetrix"){
    this.printReciept();
  }
 else if(this.printerLayOut=="lasera5"){
  this.printReciept()
 }




  
}


printReciept(){
  const printContents =  document.getElementById('receipt')?.innerHTML;

  // if (!printContents) {
  //   console.error('No content found to print!');
  //   return;
  // }

  const printWindow = window.open('', '_blank', 'height=500, width=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 12pt;
              font-weight:bold;
            }
            #receipt, #duplicateRecipt {
              width: 6in; /* Width in inches */
              height: 4in; /* Height in inches */
              position: relative;
            }
            div {
              position: absolute;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  } else {
    console.error('Failed to open print window!');
  }
}

printThermlRecipt(){
  const printContents =  document.getElementById('thermalreceipt')?.innerHTML;

  // if (!printContents) {
  //   console.error('No content found to print!');
  //   return;
  // }

  const printWindow = window.open('', '_blank', 'height=500, width=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            body {
              margin: 10px;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 10pt;
              font-weight: bold;
              text-align: left;
            }

            .receipt-page {
              position: relative;
              width: 80mm;;
              height: auto;
              margin: 0 auto;
              padding: 10px;
              overflow: hidden;
              page-break-after: auto;
              border: 1px dashed #000;
            }

            .receipt-header {
              font-size: 14pt;
              font-weight: bold;
              text-align: center;
              margin-bottom: 5px;
            }

            .receipt-sub-header {
              font-size: 12pt;
              text-align: center;
              margin-bottom: 5px;
            }

            hr {
              border: 0;
              border-top: 1px solid black;
              margin: 5px 0;
            }

            .receipt-content {
              text-align: left;
              font-size: 9pt;
              margin-bottom: 3px;
            }

            .receipt-total {
              margin-top: 10px;
              font-weight: bold;
              font-size: 11pt;
              border-top: 1px solid #000;
              padding-top: 5px;
              text-align: left;
            }

            .receipt-footer {
              font-size: 9pt;
              margin-top: 10px;
              font-style: italic;
              text-align: left;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  } else {
    console.error('Failed to open print window!');
  }
}
getTransactionType(transmode: string): string {
  console.log(transmode);
  switch (transmode) {
    case 'ON':
      if (this.lang == 'en') {
        return 'ONLINE';
      } else {
        return 'ഓൺലൈൻ';
      }

    case 'CS':
      if (this.lang == 'en') {
        return 'CASH';
      } else {
        return 'ക്യാഷ്';
      }
    case 'MO':
      if (this.lang == 'en') {
        return 'MONEY ORDER';
      } else {
        return 'മണി ഓർഡർ';
      }
    case 'UP':
      if (this.lang == 'en') {
        return 'UPI';
      } else {
        return 'യുപിഐ';
      }

    case 'CH':
      if (this.lang == 'en') {
        return 'CHEQUE';
      } else {
        return 'ചെക്ക്';
      }
    case 'CR':
      if (this.lang == 'en') {
        return 'CREDIT';
      } else {
        return 'ക്രെഡിറ്റ്';
      }
    case 'DE':
      if (this.lang == 'en') {
        return 'DEBIT';
      } else {
        return 'ഡെബിറ്റ്';
      }
    default:
      return 'OTHERS';
  }
}
}

import { MasterService } from './../../../services/master/master.service';
import { Component, inject, OnInit, Type } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MobserachbtnComponent } from '../../../mobserachbtn/mobserachbtn.component';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { NotificationService } from '../../../services/notification/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { MobserachcontentsComponent } from '../mobserachcontents/mobserachcontents.component';
import { v4 as uuidv4 } from 'uuid';
import { SearchByBillNumberComponent } from '../search-by-bill-number/search-by-bill-number.component';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fixedbottom',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MobserachbtnComponent,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './fixedbottom.component.html',
  styleUrl: './fixedbottom.component.css',
})
export class FixedbottomComponent implements OnInit {
  customerdetailsForBillingForm: FormGroup;
  totalAmount: number = 0;
  currentDate: string;
  mobileNumber: string = '';
  billNumber: string = '';
  lastBillnumber: number;
  currentBillNumber: string;
  private subscription: Subscription = new Subscription();
  private totalService = inject(TotalAmountService);
  private notiication = inject(NotificationService);
  private masterService = inject(MasterService);
  theLastBillNo: string;
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private receiptPrinrservice: ReceiptPrintService
  ) {
    this.currentDate = this.getCurrentDateMMYY();
    this.getLastBillNumber();
    const today = this.getFormattedDate(new Date());
    console.log(this.currentBillNumber);
    this.customerdetailsForBillingForm = this.fb.group({
      BillNo: [''],
      Billdate: [today, [Validators.required]],

      Mobile: ['', [Validators.pattern('^[0-9]{10}$')]],
      Address1: [''],
      Address2: [''],
      Address3: [''],
      Email: ['', [Validators.email]],
      Pincode: ['', [Validators.pattern('^[0-9]{6}$')]],
      Userid: ['0'],
      CounterId: ['1'],
      Trnsmode: ['cs'],
      Instno: [''],
      Instdate: [today],
      InstBank: [''],
      Memberid: ['1'],
    });
  }
  ngOnInit(): void {
    this.totalService.totalAmount$.subscribe((amount) => {
      this.totalAmount = amount;
    });
    console.log(this.customerdetailsForBillingForm.value);
    this.subscription.add(
      this.totalService.dataSubmitted$.subscribe(() => {
        this.getLastBillNumber();
      })
    );
    this.subscribeToTrnsmodeChanges();
    this.printReceipt();
  }
  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }
  getLastBillNumber() {
    this.masterService.getLastBillNumber().subscribe({
      next: (data) => {
        console.log(data[0].billno);
        this.lastBillnumber = data[0].billno;
        this.theLastBillNo =this.lastBillnumber.toString()+ '/'+this.currentDate ;
        console.log(this.theLastBillNo);
        this.currentBillNumber =
           (this.lastBillnumber + 1).toString()+'/'+this.currentDate ;
        this.customerdetailsForBillingForm.patchValue({
          BillNo: this.currentBillNumber,
        });
        // console.log(this.currentBillNumber);
      },
    });
  }
  printReceipt() {
    this.receiptPrinrservice.receiptData$.subscribe((data) => {
      this.printReceipts(data);
      console.log(data);
    });
  }

  private printReceipts(data: any) {
    // Extract details from data
    const {
      BillNo,
      Billdate,
      Mobile,
      Address1,
      Address2,
      Address3,
      Email,
      Pincode,
      vazhipadinfo,
    } = data;

    // Calculate the total amount
    const totalAmount = vazhipadinfo.reduce(
      (total: number, item: any) => total + parseFloat(item.Amount || '0'),
      0
    );

    // Handle multiple vazhipadinfo entries if present
    const vazhipadRows = vazhipadinfo
      .map(
        (item: any) => `
      <tr>
        <td>${item.Vazhipad}</td>
        <td>${item.Prethista}</td>
        <td>${item.Name}</td>
        <td>${item.Star}</td>
       
        <td>${item.Qty}</td>
        <td>${item.Rate}</td>
        <td>${item.Amount}</td>
        
      </tr>
    `
      )
      .join('');

    // Prepare HTML content for the receipt
    const receiptContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              @page {
                size: 3in auto; /* Set the paper size */
                margin: 0; /* Remove default margins */
              }
              body {
                width: 3in; /* Set the width to match the paper size */
                height: 4in; /* Set the height to match the paper size */
                margin: 0; /* Remove default margins */
                font-family: Arial, sans-serif;
                font-size: 12px; /* Adjust font size as needed */
              }
              table {
                width: 100%; /* Full width for table */
                border-collapse: collapse; /* Remove gaps between cells */
              }
              th, td {
                border: 1px solid black; /* Border style */
                padding: 2px; /* Adjust padding as needed */
                text-align: left;
                font-size: 10px; /* Adjust font size for table cells */
              }
              th {
                background-color: #f2f2f2; /* Header background color */
              }
              p {
                margin: 2px 0; /* Adjust margin for paragraph elements */
                font-size: 10px; /* Adjust font size for paragraphs */
              }
            }
          </style>
        </head>
        <body>
          <h1>Receipt</h1>
          <p><strong>Bill Number:</strong> ${BillNo}</p>
          <p><strong>Bill Date:</strong> ${Billdate}</p>
          <p><strong>Mobile:</strong> ${Mobile}</p>
          <p><strong>Address:</strong> ${Address1}, ${Address2}, ${Address3}</p>
          <p><strong>Email:</strong> ${Email}</p>
          <p><strong>Pincode:</strong> ${Pincode}</p>
          
          <table>
            <thead>
              <tr>
                <th>Vazhipad</th>
                <th>Prethista</th>
                <th>Name</th>
                <th>Star</th>
                
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                
              </tr>
            </thead>
            <tbody>
              ${vazhipadRows}
              <tr>
                <td colspan="6" style="text-align: right;"><strong>Total Amount:</strong></td>
                <td><strong>${totalAmount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Print the content
    this.printContent(receiptContent);
  }

  private printContent(content: string) {
    this.getLastBillNumber();
    // this.resetForm()
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Receipt</title>
          </head>
          <body onload="window.print(); window.close();">
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
  // private generateBillNumber(): number {
  // Simple example: "BILL" followed by current timestamp
  // return 'CBX-' + uuidv4();
  //  return this.LastBillNo.billno+1
  // }
  private subscribeToTrnsmodeChanges() {
    this.customerdetailsForBillingForm
      .get('Trnsmode')
      ?.valueChanges.subscribe((value) => {
        if (value === 'cheque') {
          this.setChequeValidators();
        } else {
          this.clearChequeValidators();
        }
      });
  }
  private getFormattedDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en'); // Input type="date" expects format yyyy-MM-dd
  }
  onSubmit() {
    if (this.customerdetailsForBillingForm.invalid) {
      this.showValidationErrors();
      this.markAllFieldsAsTouched();
      return;
    }
    // const newBillNo = this.generateBillNumber();
    // this.customerdetailsForBillingForm.patchValue({ BillNo: newBillNo });
    const formData = { ...this.customerdetailsForBillingForm.value };
    formData.Billdate = this.formatToDDMMYYYY(new Date(formData.Billdate));
    formData.Instdate = this.formatToDDMMYYYY(new Date(formData.Instdate));
    this.totalService.setFirstComponentData(formData);
    this.totalService.emitClickEvent();
  }

  private markAllFieldsAsTouched() {
    this.customerdetailsForBillingForm.markAllAsTouched();
  }

  private setChequeValidators() {
    this.customerdetailsForBillingForm
      .get('Instno')
      ?.setValidators([Validators.required]);
    this.customerdetailsForBillingForm
      .get('InstBank')
      ?.setValidators([Validators.required]);
    this.customerdetailsForBillingForm
      .get('Instdate')
      ?.setValidators([Validators.required]);
    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('InstBank')
      ?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('Instdate')
      ?.updateValueAndValidity();
  }

  private clearChequeValidators() {
    this.customerdetailsForBillingForm.get('Instno')?.clearValidators();
    this.customerdetailsForBillingForm.get('InstBank')?.clearValidators();
    this.customerdetailsForBillingForm.get('Instdate')?.clearValidators();
    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('InstBank')
      ?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('Instdate')
      ?.updateValueAndValidity();
  }

  private showValidationErrors() {
    Object.keys(this.customerdetailsForBillingForm.controls).forEach((key) => {
      const controlErrors = this.customerdetailsForBillingForm.get(key)?.errors;
      if (controlErrors) {
        if (controlErrors['required']) {
          this.notiication.showError(`${key} is required`, 'Validation Error');
        }
        if (controlErrors['pattern']) {
          if (key === 'Mobile') {
            this.notiication.showError(
              'Invalid phone number. Must be 10 digits.'
            );
          }
          if (key === 'Pincode') {
            this.notiication.showError('Invalid pincode. Must be 6 digits.');
          }
        }
        if (controlErrors['email']) {
          this.notiication.showError('Invalid email format.');
        }
      }
    });
  }

  private formatToDDMMYYYY(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  openDialog(data: any) {
    this.dialog.open(MobserachcontentsComponent, {
      width: '80vw', // Set the width of the dialog
      data: data,
    });
  }

  onFind() {
    if (this.mobileNumber.length !== 10) {
      // Display a toaster or any other form of error message
      this.notiication.showError('Please enter Valid Mobile number');
      return;
    }
    // Call the API to get details by mobile number
    const payLoad = { Type: 'SearchMobile', Code: this.mobileNumber };
    this.masterService.SearchByMobileNo(payLoad).subscribe({
      next: (data) => {
        console.log(data);
        this.openDialog(data);
        this.mobileNumber = '';
      },
      error: (error) => {
        // Handle error
        alert('Error fetching data. Please try again later.');
        console.error('Error fetching data:', error);
      },
    });
  }

  onFindBillNumber() {
    if (this.billNumber.length === 0) {
      // Display a toaster or any other form of error message
      this.notiication.showError('Please enter valid Bill Number');
      return;
    }
    // Call the API to get details by mobile number
    const payLoad = { Type: 'SearchBillno', Code: this.billNumber };
    this.masterService.SearchByBillNo(payLoad).subscribe({
      next: (data) => {
        console.log(data);
        if (data.length > 0) {
          this.openDialogBillNumber(data);
          this.billNumber = '';
        } else {
          this.notiication.showError('enter valid billnumber');
        }
      },
      error: (error) => {
        // Handle error
        alert('Error fetching data. Please try again later.');
        console.error('Error fetching data:', error);
      },
    });
  }

  openDialogBillNumber(data: any) {
    this.dialog.open(SearchByBillNumberComponent, {
      width: '80vw', // Set the width of the dialog
      data: data,
    });
  }
  // resetForm(){
  // this.customerdetailsForBillingForm.reset();
  // const today = this.getFormattedDate(new Date());
  // this.customerdetailsForBillingForm.patchValue({
  //   BillNo:this.lastBillnumber+1,
  //       Billdate: today,

  //       Userid: '0',
  //       CounterId: '1',
  //       Trnsmode: 'cs',
  //       Instno: '',
  //       Instdate: today,
  //       InstBank: '',
  //       Memberid: '1',
  // })
  // }
}

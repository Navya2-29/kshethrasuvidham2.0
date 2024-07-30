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

@Component({
  selector: 'app-fixedbottom',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MobserachbtnComponent,
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './fixedbottom.component.html',
  styleUrl: './fixedbottom.component.css',
})
export class FixedbottomComponent implements OnInit {
  customerdetailsForBillingForm: FormGroup;
  totalAmount: number = 0;
  LastBillNo: any = 'No bill No';
  mobileNumber: string = '';
  private totalService = inject(TotalAmountService);
  private notiication = inject(NotificationService);
private masterService=inject(MasterService)


  constructor(private fb: FormBuilder,public dialog: MatDialog,) {
    const today = this.getFormattedDate(new Date());
    

    this.customerdetailsForBillingForm = this.fb.group({
      BillNo: ['', ],
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
    this.getLastBillNo();
    this.subscribeToTrnsmodeChanges();
  }

  private generateBillNumber(): string {
    // Simple example: "BILL" followed by current timestamp
    // return 'CBX-' + uuidv4();
    return 'CBX-'+(Math.floor(Math.random() * 90000) + 10000).toString();
  }
  private subscribeToTrnsmodeChanges() {
    this.customerdetailsForBillingForm.get('Trnsmode')?.valueChanges.subscribe((value) => {
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
    const newBillNo = this.generateBillNumber();
    this.customerdetailsForBillingForm.patchValue({ BillNo: newBillNo });
    const formData = { ...this.customerdetailsForBillingForm.value };
    formData.Billdate = this.formatToDDMMYYYY(new Date(formData.Billdate));
    formData.Instdate = this.formatToDDMMYYYY(new Date(formData.Instdate));
    this.totalService.setFirstComponentData(
      formData
    );
    this.totalService.emitClickEvent();
  }

  getLastBillNo() {
    const lastBillNumber = localStorage.getItem('lastBillNumber');
    this.LastBillNo = lastBillNumber ? JSON.parse(lastBillNumber) : null;
  }

  private markAllFieldsAsTouched() {
    this.customerdetailsForBillingForm.markAllAsTouched();
  }

  private setChequeValidators() {
    this.customerdetailsForBillingForm.get('Instno')?.setValidators([Validators.required]);
    this.customerdetailsForBillingForm.get('InstBank')?.setValidators([Validators.required]);
    this.customerdetailsForBillingForm.get('Instdate')?.setValidators([Validators.required]);
    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
    this.customerdetailsForBillingForm.get('InstBank')?.updateValueAndValidity();
    this.customerdetailsForBillingForm.get('Instdate')?.updateValueAndValidity();
  }

  private clearChequeValidators() {
    this.customerdetailsForBillingForm.get('Instno')?.clearValidators();
    this.customerdetailsForBillingForm.get('InstBank')?.clearValidators();
    this.customerdetailsForBillingForm.get('Instdate')?.clearValidators();
    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
    this.customerdetailsForBillingForm.get('InstBank')?.updateValueAndValidity();
    this.customerdetailsForBillingForm.get('Instdate')?.updateValueAndValidity();
  }

  private showValidationErrors() {
    Object.keys(this.customerdetailsForBillingForm.controls).forEach(key => {
      const controlErrors = this.customerdetailsForBillingForm.get(key)?.errors;
      if (controlErrors) {
        if (controlErrors['required']) {
          this.notiication.showError(`${key} is required`, 'Validation Error');
        }
        if (controlErrors['pattern']) {
          if (key === 'Mobile') {
            this.notiication.showError('Invalid phone number. Must be 10 digits.');
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
  openDialog(data:any) {
    
      this.dialog.open(MobserachcontentsComponent, {
        width: '80vw', // Set the width of the dialog
        data: data
      }); 
  }

  onFind() {
    if (this.mobileNumber.length !== 10) {
      // Display a toaster or any other form of error message
     this.notiication.showError("Please enter Valid Mobile number")
      return;
    }
    // Call the API to get details by mobile number
    const payLoad={"Type":"SearchMobile","Code":this.mobileNumber}
    this.masterService.SearchByMobileNo(payLoad).subscribe({
     next: (data) => {
console.log(data);
        this.openDialog(data);
      },
     error: (error) => {
        // Handle error
        alert('Error fetching data. Please try again later.');
        console.error('Error fetching data:', error);
      }
  });
  }
}

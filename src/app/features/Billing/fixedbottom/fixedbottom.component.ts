import { Component, inject, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MobserachbtnComponent } from '../../../mobserachbtn/mobserachbtn.component';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-fixedbottom',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MobserachbtnComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './fixedbottom.component.html',
  styleUrl: './fixedbottom.component.css',
})
export class FixedbottomComponent implements OnInit {
  customerdetailsForBillingForm: FormGroup;
  totalAmount: number = 0;
  LastBillNo: any = 'No bill No';
  private totalService = inject(TotalAmountService);
  private notiication = inject(NotificationService);



  constructor(private fb: FormBuilder) {
    const today = this.getFormattedDate(new Date());
        const billNo = this.generateBillNumber(); // Generate bill number
    this.customerdetailsForBillingForm = this.fb.group({
      BillNo: [billNo, [Validators.required]],
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
    return 'cbx' + Date.now();
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
}

import { Component, inject, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MobserachbtnComponent } from '../../../mobserachbtn/mobserachbtn.component';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';

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
  LastBillNo:any='No bill No';
  private totalService = inject(TotalAmountService);
  constructor(private fb: FormBuilder) {
    const today = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    const billNo = this.generateBillNumber(); // Generate bill number
    this.customerdetailsForBillingForm = this.fb.group({
      BillNo: [billNo,[Validators.required]],
      Billdate: [today,[Validators.required]],
      paymentNumber: [''],
      Mobile: [''],
      Address1: [''],
      Address2: [''],
      Address3: [''],
      Email: [''],
      Pincode: [''],
      Userid: ['0'],
      CounterId: ['1'],
      Trnsmode: ['cs'],
      Instno: [''],
      Instdate: ['10-07-2024'],
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
  }

  private generateBillNumber(): string {
    // Simple example: "BILL" followed by current timestamp
    return 'cbx' + Date.now();
  }
  onSubmit() {
    this.totalService.setFirstComponentData(
      this.customerdetailsForBillingForm.value
    );
    this.totalService.emitClickEvent();
    
  }

  getLastBillNo(){
    const lastBillNumber = localStorage.getItem('lastBillNumber');
    this.LastBillNo = lastBillNumber ? JSON.parse(lastBillNumber) : null;

    // this.totalService.getBillNumber().subscribe((billNumber) => {
    //   this.LastBillNo = billNumber;
    // });
  }
  
}

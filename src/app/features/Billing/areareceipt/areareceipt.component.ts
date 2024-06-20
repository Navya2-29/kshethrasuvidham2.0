import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MorebuttonComponent } from '../../../morebutton/morebutton.component';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MobserachbtnComponent } from '../../../mobserachbtn/mobserachbtn.component';
import { MultidayComponent } from '../multiday/multiday.component';
import { MasterService } from '../../../services/master/master.service';
import { VMList } from '../../../models/day-master.model';
import { TotalAmountService } from '../../../shared/service/total-amount.service';

@Component({
  selector: 'app-areareceipt',
  standalone: true,
  imports: [
    MatTableModule,
    MatCheckboxModule,
    CommonModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatIconModule,
    MatRadioModule,
    MobserachbtnComponent,
    MultidayComponent,
    MorebuttonComponent,
  ],
  templateUrl: './areareceipt.component.html',
  styleUrl: './areareceipt.component.css',
  providers: [DatePipe]
})


export class AreareceiptComponent implements OnInit {
 
  form: FormGroup;
  nakshatham: any[];
  VMList: VMList[];
  today:string;
  tomarrow:string;
  bookingFlag:boolean=false;
  private masterService = inject(MasterService);
  private totalAmountService = inject(TotalAmountService); 
  constructor(private fb: FormBuilder,private datePipe: DatePipe) {
    const currentDate=new Date();
    this.today=currentDate.toISOString().split('T')[0];
    const nextDate=new Date(currentDate);
    nextDate.setDate(currentDate.getDate() +1);
    console.log(nextDate)
    this.tomarrow=nextDate.toISOString().split('T')[0]
      console.log(currentDate)
    this.form = this.fb.group({
      rows: this.fb.array([this.createRow()]),
      totalAmount: [{ value: 0, disabled: true }],
    });
  }

  ngOnInit(): void {
    this.getNakshthram();
    this.getAllVazhipad();
  }

  getNakshthram() {
    this.masterService.getNakshthra().subscribe((res) => {
      this.nakshatham = res;
    });
  }
  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd-MM-yyyy') || '';
  }
  getAllVazhipad() {
    this.masterService.getVmaster().subscribe({
      next: (data) => {
        this.VMList = data.map((item) => ({
          VM_Id: item.VM_Id,
          VM_Name: item.VM_Name,
          VM_Code: item.VM_Code,
        }));
        // Ensure the subscription for the initial row is set up properly
        this.subscribeToFormArrayChanges();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  get formArray(): FormArray {
    return this.form.get('rows') as FormArray;
  }

  createRow(): FormGroup {
    const row = this.fb.group({
      vazhipad: ['', Validators.required],
      name: ['', Validators.required],
      star: ['', Validators.required],
      dietee: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      rate: ['', Validators.required],
      amount: [{ value: '', disabled: true }, Validators.required],
      date: [this.today, Validators.required],
      time: ['', Validators.required],
      dieties:[[]]
    });
    // Subscribe to qty and rate changes to calculate the amount
    this.subscribeToAmountCalculation(row);
    return row;
  }

  addRow() {
    const row = this.createRow();
    this.formArray.push(row);
    this.subscribeToVazhipadChanges(row);
    this.updateTotalAmount(); // Update total amount when a new row is added
  }

  removeRow(index: number) {
    this.formArray.removeAt(index);
    this.updateTotalAmount(); // Update total amount when a row is removed
  }

  save() {
    if (this.form.valid) {
      const data = this.form.value.rows;
      console.log(data);
    } else {
      console.log('Form is invalid');
    }
  }

  subscribeToFormArrayChanges() {
    this.formArray.controls.forEach((control, index) => {
      const row = control as FormGroup;
      this.subscribeToVazhipadChanges(row);
    });
  }

  subscribeToVazhipadChanges(row: FormGroup) {
    const vazhipadControl = row.get('vazhipad');
    if (vazhipadControl) {
      vazhipadControl.valueChanges.subscribe((value) => {
        const selectedOption = this.VMList.find(option => option.VM_Name === value);
        if (selectedOption) {
          this.masterService.getVazhipadeByCode(selectedOption.VM_Code).subscribe({
            next: (data) => {
              this.updateRowWithApiResponse(data, row);
              this.callAnotherApi(selectedOption.VM_Code, row);
            },
            error: (err) => {
              console.error(err);
            }
          });
        }
      });
    }
  }

  subscribeToAmountCalculation(row: FormGroup) {
    const qtyControl = row.get('qty');
    const rateControl = row.get('rate');
    const calculateAmount = () => {
      const qty = qtyControl?.value;
      const rate = rateControl?.value;
      if (qty != null && rate != null) {
        const amount = qty * rate;
        row.get('amount')?.setValue(amount, { emitEvent: false });
        this.updateTotalAmount(); // Update total amount when qty or rate changes
      }
    };

    qtyControl?.valueChanges.subscribe(calculateAmount);
    rateControl?.valueChanges.subscribe(calculateAmount);
  }

  private updateRowWithApiResponse(response: any, row: FormGroup): void {
    const data = response[0];
if(data.VM_Blocking==="Y"){
  this.bookingFlag=true
}
    console.log(data); 
    row.patchValue({
      rate: data.VM_Amt, 
      time:data.VM_Time,
       date:data.VM_Booking==="Y"?this.tomarrow:this.today
    });
    const rateControl = row.get('rate')!;
    if (data.ratechange === 'Y') {
      rateControl.enable();
      rateControl.setValidators([Validators.required]);
    } else {
      rateControl.disable();
      rateControl.clearValidators();
    }
    rateControl.updateValueAndValidity()

  }

  private updateTotalAmount(): void {
    const rows = this.formArray.controls as FormGroup[];
    const total = rows.reduce((sum, row) => {
      const amount = row.get('amount')?.value;
      return sum + (amount ? amount : 0);
    }, 0);
    this.form.get('totalAmount')?.setValue(total, { emitEvent: false });
    this.totalAmountService.setTotalAmount(total); // Update the service
  }
  

  private updateRowWithPrathishta(response: any, row: FormGroup): void {
    // Assuming response contains the array of dieties
    row.patchValue({
      dieties: response,
    });
    console.log(row);
  }
  private callAnotherApi(vmCode: string, row: FormGroup): void {
    this.masterService.getVazhipadByCodeForDiety(vmCode).subscribe({
      next: (response) => {
        console.log(response);
        this.updateRowWithPrathishta(response, row);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  
  vazhipadtime=[{
    "id":"0",
    "name":"Any Time"
  },{
    "id":"2",
    "name":"​വൈകുന്നേരം"
  },
  {
    "id":"1",
    "name":"രാവിലെ"
  }
]

}

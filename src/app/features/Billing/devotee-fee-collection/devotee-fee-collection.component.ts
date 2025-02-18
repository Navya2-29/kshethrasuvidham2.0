import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';
@Component({
  selector: 'app-devotee-fee-collection',
  standalone: true,
  imports: [
    MatIconModule,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
  ],
  templateUrl: './devotee-fee-collection.component.html',
  styleUrl: './devotee-fee-collection.component.css',
})
export class DevoteeFeeCollectionComponent implements OnInit {
  lang: string | null;
  toppings = new FormControl('');
  feeCollctionForm: FormGroup;
  loginId: string | null;
  counterId: string | null;
  itemList: any[];
  lockTableLastbillNumber: number;
  billNumberFormatDate: string;
  generatedCurrentBillnumber: string;
  yearList: number[] = [];
  toppingList: string[] = [
    'Jan',
    'Feb',
    'March',
    'April',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ];


  constructor(
    private ts: TranslateService,
    private masterService: MasterService,
    private fb: FormBuilder
  ) {
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.counterId = localStorage.getItem("counterId");
    this.loginId = localStorage.getItem('LoginId')
    this.billNumberFormatDate = this.getCurrentDateMMYY();
    this.feeCollctionForm = this.fb.group({
      Mobile: ['', Validators.required],
      MemberId: ['', Validators.required],
      BillNo: ["", Validators.required],
      ItemType: ['', Validators.required],
      TransMode: ['CS', Validators.required],
      UserId: [this.loginId, Validators.required],
      CounterId: [this.counterId, Validators.required],
      Instano: [''],
      Instdate: [''],
      InstBank: [''],
      TranStatus: ['S'],
      Year: ['',],
      Name: [''],
      Address: [''],
      Amount: [''],
      totalAmount: [''],
      vazhipadInfo: this.fb.array([])
    })
  }
  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.yearList = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  }
  getDevteeMasteItem() {
    const payLoad = {
      Type: "SubscriptionItem",
      Code: ""
    }
    this.masterService.getMaster(payLoad).subscribe((data) => {
      console.log(data, "fee item")
      this.itemList = data
    })
  }

  ngOnInit(): void {
    this.getDevteeMasteItem();
    // this.getBillNumber()
    this.generateYearList();
    this.feeCollctionForm.get('ItemType')?.valueChanges.subscribe((value) => {
      this.onItemTypeChange(value);
    });
    this.toppings.valueChanges.subscribe((selectedMonths: any) => {
      this.updateVazhipadInfo(selectedMonths);
    });
  }

  updateVazhipadInfo(selectedMonths: string[]) {
    const vazhipadArray = this.feeCollctionForm.get('vazhipadInfo') as FormArray;
    vazhipadArray.clear(); 

    selectedMonths.forEach(Month => {
      vazhipadArray.push(this.fb.group({ Month }));
    });

    const totalAmount = selectedMonths.length * Number(this.feeCollctionForm.get('Amount')?.value);
    this.feeCollctionForm.patchValue({ totalAmount: totalAmount });
  }



  search() {
    const mobileNumber = this.feeCollctionForm.get('Mobile')?.value;
    console.log(mobileNumber)
    if (mobileNumber) {
      console.log('Searching for:', mobileNumber);
      const payload = {
        Type: "MemberID",
        Code: mobileNumber
      }
      this.masterService.getMaster(payload).subscribe({
        next: (data) => {
          console.log(data, "mobile number");
          this.feeCollctionForm.patchValue({
            MemberId: data[0].MID,
            Name: data[0].Name,
            Address: data[0].Address
          })
        }
      })
     
    } else {
      console.log('Please enter a mobile number');
    }
  }


  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }

  onItemTypeChange(value: any) {
    const selectedItemId = Number(value); 
    console.log(selectedItemId, "event")
    const selectedItem = this.itemList.find(item => item.NM_Id === selectedItemId);

    if (selectedItem) {
      this.feeCollctionForm.patchValue({
        Amount: selectedItem.Amount 
      });
    }
  }


  onSubmit() {
    console.log(this.feeCollctionForm.value)
    const formData = this.feeCollctionForm.value
    console.log(formData, "dd");
    const totalAmount = formData.totalAmount;
    const amount = formData.Amount;
    const updatedVazhipadInfo = formData.vazhipadInfo.map((item: any) => {
      return {
        ...item,
        Amount: amount,
        TotalAmt: totalAmount,
      };
    });

this.getBillNumber()

    const payLoad = {
      Memberid: formData.MemberId.toString(),
      BillNo: this.generatedCurrentBillnumber,
      ItemType: formData.ItemType,
      Trnsmode: formData.TransMode,
      Userid: formData.UserId,
      CounterId: formData.CounterId,
      Instno: formData.Instano,
      Instdate:"18-02-2025",
      InstBank: formData.InstBank,
      TranStatus: formData.TranStatus,
      Year: formData.Year,
      vazhipadinfo: updatedVazhipadInfo,
    }
    this.masterService.addFeeCollection(payLoad).subscribe((data)=>{
      console.log(data)
      if(data.RespStatus=="I"){
        const payLoad={
          Type:"UpdateBillNoFeeCollection",
          Code:this.lockTableLastbillNumber+1
        }
        this.masterService.getMaster(payLoad).subscribe((data)=>{
          console.log(data,"updatebillnumber");
        })
      }
      
    })
  }

  getBillNumber() {
    const payLoad = {
      Type: "MaxBillnoFeeCollection",
      Code: ""
    }
    this.masterService.getMaster(payLoad).subscribe((data) => {
      console.log(data, "bill");
      if (data[0].billno) {
        this.lockTableLastbillNumber = data[0].billno;
        console.log(this.lockTableLastbillNumber);
        console.log(this.billNumberFormatDate);
        this.generatedCurrentBillnumber =
          'FC' + this.lockTableLastbillNumber.toString() +
          '/' +
          this.billNumberFormatDate;
        console.log(this.generatedCurrentBillnumber, "fc bill");
        // updatedData.BillNo = this.generatedCurrentBillnumber;
        // console.log(updatedData, 'after add bill number');

        // const payLoad = {
        //   Type: 'FeeCollectionBillLock',
        //   Code: this.counterId + 'Lock',
        // };
        // console.log(payLoad);
        // this.masterService.getMaster(payLoad).subscribe((data) => {
        //   console.log(data, 'locked billapi reposnse');
        //   // this.onSubmitBookingDetailsApiCall(updatedData);
        // });

      } else {
        // this.retryFetchBillNumber(updatedData);
      }
    })
  }
}

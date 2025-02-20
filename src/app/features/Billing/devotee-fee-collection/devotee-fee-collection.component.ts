import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';
import { NotificationService } from '../../../services/notification/notification.service';
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
  formattedDate:any;
  lockTableLastbillNumber: number;
  billNumberFormatDate: string;
  generatedCurrentBillnumber: string;
  DevoteemobileNumber:string;
  devoteeFeeeCollectiondetails:any[];
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
today:Date;
todayDate:any;
  constructor(
    private ts: TranslateService,
    private masterService: MasterService,
    private fb: FormBuilder,
    private notification:NotificationService 
  ) {
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.counterId = localStorage.getItem("counterId");
    this.loginId = localStorage.getItem('LoginId')
    this.billNumberFormatDate = this.getCurrentDateMMYY();
    this. today=new Date();
    this. formattedDate = this.today.toISOString().split('T')[0];
    this.todayDate=this.today.toISOString().split('T')[0];
    this.feeCollctionForm = this.fb.group({
      Mobile: ['', [Validators.required,Validators.pattern('^[0-9]{10}$')]],
      MemberId: ['', Validators.required],
      BillNo: ["", Validators.required],
      ItemType: ['', Validators.required],
      TransMode: ['CS', Validators.required],
      UserId: [this.loginId, Validators.required],
      CounterId: [this.counterId, Validators.required],
      Instano: [''],
      Instdate: [this.formattedDate],
      InstBank: [''],
      TranStatus: ['S'],
      Year: ['', Validators.required],
      Name: ['', Validators.required],
      Address: ['', Validators.required],
      Amount: ['', Validators.required],
      totalAmount: ['', Validators.required],
      vazhipadInfo: this.fb.array([], Validators.required)
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

  formatDateToDDMMYYYY(dates: any): string {
    const date = new Date(dates);
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  ngOnInit(): void {
    this.getDevteeMasteItem();
    this.getBillNumberforFeecollection()
    this.generateYearList();
    this.feeCollctionForm.get('ItemType')?.valueChanges.subscribe((value) => {
      this.onItemTypeChange(value);
    });
    this.toppings.valueChanges.subscribe((selectedMonths: any) => {
      this.updateVazhipadInfo(selectedMonths);
    });

    this.feeCollctionForm.get('paymentMode')?.valueChanges.subscribe(value => {
      if (value === 'CH') {
        this.feeCollctionForm.get('instBank')?.setValidators([]); // Enable
        this.feeCollctionForm.get('instDate')?.setValidators([]);
      } else {
        this.feeCollctionForm.get('instBank')?.setValue('');  // Clear value
        this.feeCollctionForm.get('instDate')?.setValue('');
        this.feeCollctionForm.get('instBank')?.setValidators(null); // Disable
        this.feeCollctionForm.get('instDate')?.setValidators(null);
      }
      this.feeCollctionForm.get('instBank')?.updateValueAndValidity();
      this.feeCollctionForm.get('instDate')?.updateValueAndValidity();
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
    if(mobileNumber?.invalid){
this.notification.showError("Invalid mobile number please enter a valid mobile number")
      return;
    }
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
          if(data.length>0){
            this.feeCollctionForm.patchValue({
              MemberId: data[0].MID,
              Name: data[0].Name,
              Address: data[0].Address
            }) 
          }else{
            this.notification.showError("No member is found in the Mobile number please check")
          }
         
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
    if(this.feeCollctionForm.valid){

   
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
      Instdate:this.formatDateToDDMMYYYY(formData.Instdate),
      InstBank: formData.InstBank,
      TranStatus: formData.TranStatus,
      Year: formData.Year,
      vazhipadinfo: updatedVazhipadInfo,
    }
    console.log(payLoad,"payload");
    this.masterService.addFeeCollection(payLoad).subscribe((data)=>{
      console.log(data)
      if(data.RespStatus=="I"){
        const payLoad={
          Type:"UpdateBillNoFeeCollection",
          Code:this.lockTableLastbillNumber+1
        }
        this.masterService.getMaster(payLoad).subscribe((data)=>{
          console.log(data,"updatebillnumber");
         this. printFeeCollection();
         this.getBillNumberforFeecollection();
         this.Reset()
        })
      }
      
    })
  }else{
    this.notification.showError('Please fill all required fields!')
  }
  }
Reset(){
  this.feeCollctionForm.reset({
    Mobile: "",
    MemberId:"",
    BillNo: "",
    ItemType:"",
    TransMode: "CS",
    UserId: this.loginId, 
    CounterId: this.counterId,
    Instano: "",
    Instdate: this.formattedDate,
    InstBank: "",
    TranStatus: 'S',
    Year: '',
    Name: '', 
    Address: '', 
    Amount: '',
    totalAmount: '', 
    vazhipadInfo:''
  });
  (this.feeCollctionForm.get('vazhipadInfo') as FormArray).clear();
  this.toppings.reset();
}
  getBillNumberforFeecollection(){
    const payLoad = {
      Type: "MaxBillnoFeeCollection",
      Code: ""
    } 
    this.masterService.getMaster(payLoad).subscribe((data)=>{
      const billnumber =
          'FC' + data[0].billno.toString() +
          '/' +
          this.billNumberFormatDate;
      this.feeCollctionForm.patchValue({
        BillNo:billnumber
      })
    })

  }

  printFeeCollection() {
    const printContents =  document.getElementById('receipt')?.innerHTML;
  
    if (!printContents) {
      console.error('No content found to print!');
      return;
    }
  
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
                font-size: 12px;
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
  searchByDevoteeByMobileNumber(){
    const payLoad={
      Type:"DevoteeFeeCollect",
      Code:this.DevoteemobileNumber
    }
this.masterService.getMaster(payLoad).subscribe((data)=>{
  console.log(data);
  this.devoteeFeeeCollectiondetails=data;
})
  }
}

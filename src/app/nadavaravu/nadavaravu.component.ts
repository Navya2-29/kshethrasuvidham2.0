import { ItemMaster } from './../models/item-master.model';
import { Data } from './../features/Billing/search-by-bill-number/search-by-bill-number.component';
import { Component, OnInit, Type } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MasterService } from '../services/master/master.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CancelBillRemarkComponent } from '../features/Billing/cancel-bill-remark/cancel-bill-remark.component';

@Component({
  selector: 'app-nadavaravu',
  standalone: true,
  imports: [MatIconModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './nadavaravu.component.html',
  styleUrl: './nadavaravu.component.css',
})
export class NadavaravuComponent implements OnInit {
  nadavaravForm: FormGroup;
  userId: string | null;
  role: string | null;
  CounterId: string | null;
  nakshatham: any[];
  itemMaster: ItemMaster[] = [];
  currentDate: string;
  lastBillnumber: number;
  currentBillNumber: string;
  theLastBillNo: string;
  nadavaravData: any[] = [];
  filteredData: any[] = [];
  searchForm: FormGroup;
  today: Date = new Date();
  cancellationReason: string;
  cancelBillNumber: string;
  nadavaravuDataPrint:any;
  templeName:string |null;
  templeAddress:string |null;
  logo:string |null;
  name:string |null;
  templeLogoUrl: string = '';
starName:string;
  dupliacteBillData:any;
  itemName:string;
  constructor(
    private fb: FormBuilder,
    private service: MasterService,
    private notification: ToastrService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.userId = localStorage.getItem('LoginId');
    this.role = localStorage.getItem('Role');
    this.CounterId = localStorage.getItem('counterId');
    this.templeName=localStorage.getItem('TempleName');
    this.templeAddress=localStorage.getItem('Address');
    this.logo=localStorage.getItem('Logo');
    this.name=localStorage.getItem('name');
    
    if(this.logo){

      this.templeLogoUrl=`assets/images/${this.logo}`;
      console.log( this.templeLogoUrl);
    }
    this.nadavaravForm = this.fb.group({
      BillNo: ['', [Validators.required]],
      Name: ['', [Validators.required]],
      Star: [''],
      Address: [''],
      Description: [''],
      NMId: ['', [Validators.required]],
      Qty: ['1'],
      weight: [''],
      unit: [''],
      ItemValue: ['0'],
      ReceiptAmount: ['0'],
      Remarks: [''],
      TrnsMode: ['CS'],
      UserId: [this.userId],
      CounterId: [this.CounterId],
    });
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      searchDate: [''],
      searchBillNO: [''],
    });
    this.currentDate = this.getCurrentDateMMYY();
    this.getBillNumber();
    this.getStar();
    this.getNadavaravuItem();
    this.setupConditionalValidationForItemValue();
    this.getNadavaravuData();
  }


  
  setupConditionalValidationForItemValue() {
    this.nadavaravForm.get('ItemValue')?.valueChanges.subscribe((value) => {
      if (value) {
        this.nadavaravForm.get('weight')?.setValidators(Validators.required);
        this.nadavaravForm.get('unit')?.setValidators(Validators.required);
      } else {
        this.nadavaravForm.get('weight')?.clearValidators();
        this.nadavaravForm.get('unit')?.clearValidators();
      }
      this.nadavaravForm.get('weight')?.updateValueAndValidity();
      this.nadavaravForm.get('unit')?.updateValueAndValidity();
    });
  }



  onSubmit() {
    if (this.nadavaravForm.invalid) {
      this.notification.error(
        'Please fill the form before saving.',
        'Nadavarav'
      );
      this.markAllFieldsAsTouched();
      return;
    }
    console.log(this.nadavaravForm.value);
    // const payLoad = {};
     // Get the Star ID from the form
  const starId = this.nadavaravForm.get('Star')?.value;
  console.log(starId,"iiiiiiiiiiii");
  const starName = this.getStarNameById(starId);
  this.starName=this.getStarNameById(starId); // Map the Star ID to Star Name
console.log(starName,"")

  const itemName=this.getItemById(this.nadavaravForm.value?.NMId)
  console.log(itemName,"aaaaaaaaaaaaaaaaaaaaaaa")
  this.itemName=itemName
  const formData = this.nadavaravForm.value;
  formData.Star = starName; 
  console.log(formData); 

  // Continue with your service call to submit the form data
  this.nadavaravuDataPrint = formData;
    const payLoad={
      "BillNo": this.nadavaravForm.value?.BillNo,
      "Name": this.nadavaravForm.value?.Name,
      "Star": starId,
      "Address": this.nadavaravForm.value?.Address,
      "Description":this.nadavaravForm.value?.Description,
      "NMId":this.nadavaravForm.value?.NMId,
      "Qty":this.nadavaravForm.value?.Qty,
      "weight": this.nadavaravForm.value?.weight,
      "unit": this.nadavaravForm.value?.BillNo,
      "ItemValue": this.nadavaravForm.value?.ItemValue,
      "ReceiptAmount": this.nadavaravForm.value?.ReceiptAmount,
      "Remarks": this.nadavaravForm.value?.Remarks,
      "TrnsMode": this.nadavaravForm.value?.TrnsMode,
      "UserId":this.nadavaravForm.value?.UserId,
      "CounterId": this.nadavaravForm.value?.CounterId
  }
    this.service.nadavaravBooking(payLoad).subscribe({
      next: (data) => {
        console.log(data);

        if (data.RespStatus == 'I') {
         
          this.notification.success(data.RespMsg);
          this.resetForm();
          this.printNadavaravuData()
          const currentBillnumber = this.lastBillnumber + 1;
          console.log(currentBillnumber, '_1');
          this.service.updateNadavaravuBillNumber(currentBillnumber).subscribe({
            next: (data) => {
              console.log(data, 'update');
              this.getBillNumber();
              this.getNadavaravuData();
            },
            error: (err) => {},
          });

          // this.printReceipt();
        }
      },
      error: (error) => {},
    });
  }

  markAllFieldsAsTouched() {
    Object.keys(this.nadavaravForm.controls).forEach((field) => {
      const control = this.nadavaravForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  resetForm() {
    this.nadavaravForm.reset({
      BillNo: '',
      Name: '',
      Star: '',
      Address: '',
      Description: '',
      NMId: '',
      Qty: '1',
      weight: '',
      unit: '',
      ItemValue: '0',
      ReceiptAmount: '0',
      Remarks: '',
      TrnsMode: 'CS',
      UserId: this.userId,
      CounterId: this.CounterId,
    });
    this.getBillNumber();
  }


  getStar() {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.service.getStarData(payLoad).subscribe((res) => {
      this.nakshatham = res;
      console.log(this.nakshatham);
    });
  }


  getNadavaravuItem() {
    const payLoad = {
      Type: 'NadavaravuALL',
      Code: '',
    };

    this.service.getItemMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data,"bbbbbbbbbbbbbbbbbb");
        this.itemMaster = data;
      },
    });
  }


  getBillNumber() {
    const payLoad = {
      Type: 'MaxBillnoNadavaravu',
      code: '',
    };
    this.service.getNadavaravBillNumber(payLoad).subscribe({
      next: (data) => {
        console.log(data);

        console.log(data[0].billno);
        this.lastBillnumber = data[0].billno;
        this.theLastBillNo =
          'NV' + this.lastBillnumber.toString() + '/' + this.currentDate;
        console.log(this.theLastBillNo);
        this.currentBillNumber =
          (this.lastBillnumber + 1).toString() + '/' + this.currentDate;
        console.log(this.currentBillNumber);
        this.nadavaravForm.patchValue({
          BillNo: this.theLastBillNo,
        });
      },
    });
  }

  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }

  getNadavaravuData() {
    const payLoad = { Type: 'NadavaravuBooking', Code: '' };
    this.service.getNadavaravBooking(payLoad).subscribe((data) => {
      console.log(data);
      this.nadavaravData = data;
      this.filteredData = this.nadavaravData;
    });
  }

  onSearch(): void {
    const searchBillNo = this.searchForm
      .get('searchBillNO')
      ?.value?.trim()
      .toLowerCase(); // Case insensitive
    console.log(searchBillNo);
    if (!searchBillNo) {
      this.filteredData = this.nadavaravData; // Show all data if no input
      return;
    }

    this.filteredData = this.nadavaravData.filter(
      (row) => row.BillNo?.toLowerCase().includes(searchBillNo) // Match bill number
    );

    if (this.filteredData.length === 0) {
      console.log('No records found for the entered bill number.');
    }
  }

  

  goBack() {
    this.router.navigate(['dashboard']);
  }

  openCancelRemarkDialog() {
    const remarkDialogRef = this.dialog.open(CancelBillRemarkComponent, {
      width: '400px',
      data: { reason: this.cancellationReason }, // You can pass data to the new component here
    });

    remarkDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cancellationReason = result; // Update the cancellationReason with the value from the dialog
        console.log('Updated Cancellation Reason:', this.cancellationReason);
        this.OnCancelSubmit();
      } else {
        console.log('Dialog was closed without submitting the reason.');
      }
    });
  }

  cancellTheBill(billnumber: string) {
    this.cancelBillNumber = billnumber;
    this.openCancelRemarkDialog();
  }

  OnCancelSubmit() {
    this.cancellationReason;
    console.log(this.cancellationReason, 'cancellarion reason');

    const payLoad = {
      Type: 'Nadavaravu',
      BillNo: this.cancelBillNumber,
      CancelBy: this.userId,
      Remarks: this.cancellationReason,
    };
    console.log(payLoad, 'payload');
    this.service.cancellBill(payLoad).subscribe({
      next: (data: any) => {
        if (data.RespStatus === 'U') {
          console.log(data, 'cancel bill response');
          if (this.dialog) {
            // this.dialog.close(); // This will close only the remark popup
          }
          // this.searchBillNumber();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }


  duplicateBill(item:any){
   console.log(item,"dattataaa") 
   this.dupliacteBillData=item
   console.log(this.dupliacteBillData,"dattataaa") 
  }
 

  
  printNadavaravuData() {
    const printSection = document.getElementById('nadavaravuPrintSection');
    if (printSection) {
      // Open a new window for printing
      const printWindow = window.open('', '_blank', 'width=600,height=400');
      printWindow?.document.write('<html><head><title>Print Receipt</title></head><body>');
      printWindow?.document.write(printSection.innerHTML); // Add the content to the print window
      printWindow?.document.write('</body></html>');
      printWindow?.document.close(); // Close the document for rendering
      printWindow?.print(); // Trigger the print dialog
    }


  }

  getStarNameById(starId: number): string {
    console.log(starId,"zxcz");
    const star = this.nakshatham.find((s) => s.id == starId);
    console.log(star);
    return star ? star.SM_NameEng : ''; // Return the name if found, otherwise return an empty string
  }


  getItemById(itemid: any): string {
    console.log(itemid,"zxcz");
    const star = this.itemMaster.find((s) => s.NM_Id == itemid);
    console.log(star);
    return star ? star.NM_Name : ''; // Return the name if found, otherwise return an empty string
  }

}

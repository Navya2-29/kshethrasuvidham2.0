import { VMList } from './../../../models/day-master.model';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MorebuttonComponent } from '../../../morebutton/morebutton.component';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MobserachbtnComponent } from '../../../mobserachbtn/mobserachbtn.component';
import { MultidayComponent } from '../multiday/multiday.component';
import { MasterService } from '../../../services/master/master.service';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { Observable, Subscription, map, of, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MultidayitemsComponent } from '../multidayitems/multidayitems.component';
import { MultidaybookeddetailsComponent } from '../multidaybookeddetails/multidaybookeddetails.component';

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
  providers: [DatePipe],
})
export class AreareceiptComponent implements OnInit {
 
  // private multidayService = inject(MultidayService);
  form: FormGroup;
  row: FormArray;
  filteredOptions: any[] = [];
  nakshatham: any[];
  VMList: any[] = [];
  totalAmount: number = 0;
  autoCompleteFields: MatAutocomplete[] = [];
  clickReceived = false;
  today: string;
  prathishtaOptions: any[] = [];
  private subscription: Subscription;
  private masterservice = inject(MasterService);
  private eventService = inject(TotalAmountService);
  constructor(private fb: FormBuilder, public dialog: MatDialog,private datePipe: DatePipe) {
    const currentDate = new Date();
    this.today = currentDate.toISOString().slice(0, 10);
    this.form = this.fb.group({
      vazhipadinfo: this.fb.array([]),
    });
  }


 

  ngOnInit(): void {
    this.getAllvazhipad();
    this.getNakshthram();
    // this.addRow(0);

    this.subscription = this.eventService.clickEvent$.subscribe(() => {
      this.clickReceived = true;
      // Handle the event here
      console.log('Click event received!');

      this.eventService.setSecondComponentData(this.form.value);
      const combinedData = this.eventService.getAllData();
      // this.sendDataToApi(combinedData);
      this.sendDataToApi(combinedData)
    });
  }

  ngOnDestroy() {
    // Prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  createRow(): FormGroup {
    const row = this.fb.group({
      Slno: [''],
      Vazhipad: [''],
      Vazhid: [''],
      Name: ['',[Validators.required]],
      Star: ['',[Validators.required]],
      Prethista: [''],
      Qty: [1],
      Rate: [''],
      Amount: [''],
      VazhipadDate: [this.today,[Validators.required]],
      
      TotalAmt: [this.totalAmount],
      time: [{ disabled: true, value: '' }],
      // multidaybookedDetails: this.fb.array([]),
      Name2: [''],
      Star2: [''],
      Postal: ['10'],
      PMid: ['1'],
      Mday: [''],
      NalBy: [''],
      Mmonth: [''],
      multiname: [{disabled:true,value:''}],
      booking:[{disabled:true,value:''}],
      ratechange:[{disabled:true,value:''}],

    });
    row.get('Qty')?.valueChanges.subscribe(() => this.updateAmount(row));
    row.get('Rate')?.valueChanges.subscribe(() => this.updateAmount(row));

    return row;
  }

  get vazhipadinfo(): FormArray {
    return this.form.get('vazhipadinfo') as FormArray;
  }

  addRow(index: number): void {

    if (this.vazhipadinfo.length > 0 && !this.vazhipadinfo.at(this.vazhipadinfo.length - 1).valid) {
      console.error('The last row is not valid. Please complete it before adding a new row.');
      return;
    }
    console.log(index);
    this.vazhipadinfo.insert(index + 1, this.createRow());
    this.setupAutocomplete(index + 1);
    this.updateTotalAmount();
    this.updateSlno();
  }

  removeRow(index: number) {
    if (this.vazhipadinfo.length > 1) {
      this.vazhipadinfo.removeAt(index);
      this.updateTotalAmount();
      this.updateSlno();
      // this.setAutocompleteFilteredOption();
    }
  }

  // formatting date in dd-mm-yyyy
  dateFormat(date: Date): any {
    return this.datePipe.transform(date, 'dd-MM-yyyy') || '';
  }

  setupAutocomplete(index: number): void {
    const row = this.vazhipadinfo.at(index) as FormGroup;
    const control = row.get('Vazhipad');
    control?.valueChanges
      .pipe(
        startWith(''),
        map((value) => this._filter(value))
      )
      .subscribe((filteredOptions) => {
        this.filteredOptions[index] = filteredOptions;
      });
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.VMList.filter((option) =>
      option.VM_Name.toLowerCase().includes(filterValue)
    );
  }

  getAllvazhipad() {
    this.masterservice.getVmaster().subscribe((data) => {
      this.VMList = data.map((item) => ({
        VM_Id: item.VM_Id,
        VM_Name: item.VM_Name,
        VM_Code: item.VM_Code,
      }));
    });
    this.addRow(-1);
  }

  getNakshthram() {
    this.masterservice.getNakshthra().subscribe((res) => {
      this.nakshatham = res;
    });
  }

  updateSlno(): void {
    this.vazhipadinfo.controls.forEach((row, index) => {
      row.get('Slno')?.setValue(index + 1);
    });
  }
  vazhipadtime = [
    { id: '0', name: 'Any Time' },
    { id: '1', name: 'Morning' },
    { id: '2', name: 'Evening' },
  ];

  onSelect(event: MatAutocompleteSelectedEvent, index: number): void {
    console.log(index);
    const selectedVazhipad = event.option.value;
    console.log(selectedVazhipad);
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    selectedRow.get('Vazhipad')?.setValue(selectedVazhipad);
    console.log(selectedRow);
    // Fetch vazhipad details
    console.log(this.VMList);
    const selectedVazhipadItem = this.VMList.find(
      (item) => item.VM_Name === selectedVazhipad
    );
    console.log(selectedVazhipadItem);
    if (selectedVazhipadItem) {
      selectedRow.get('Vazhid')?.setValue(selectedVazhipadItem.VM_Id);
      console.log(selectedRow);
      // Fetch vazhipad details using VM_Code
      const vazhipadCode = selectedVazhipadItem.VM_Code;
      console.log(vazhipadCode);
      this.fetchVazhipadDetails(vazhipadCode, index);
    } else {
      console.error('Selected vazhipad item not found in VMList');
      // Handle error or feedback if needed
    }
  }

  fetchVazhipadDetails(vazhipadcode: string, index: number): void {
    this.masterservice
      .getVazhipadeByCode(vazhipadcode)
      .subscribe((res: any) => {
        console.log(res);
        const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
        console.log(selectedRow);
        selectedRow.get('Rate')?.setValue(res[0].VM_Amt);
          selectedRow.get('multiname')?.setValue(res[0].VM_MultiName);
          selectedRow.get('booking')?.setValue(res[0].VM_Booking);
          selectedRow.get('ratechange')?.setValue(res[0].VM_Rate_Change);

          this.selectedVazhipadPrathistaDetails(vazhipadcode,index);
        //   selectedRow.get('rate')?.setValue(res.rate);
        console.log(selectedRow);
      });
  }


// fetch parthishta details

selectedVazhipadPrathistaDetails(vazhipadcode:any,index:number){
  this.masterservice.getVazhipadByCodeForDiety(vazhipadcode).subscribe({
    next:(res:any)=>{
      console.log(res);
      this.prathishtaOptions[index] = res.map((item:any) => ({
        id: item.PM_ID,
        name: item.PM_Name
      }));

      if (this.prathishtaOptions[index].length > 0) {
        console.log(this.prathishtaOptions[index])
        const defaultPrathishta = this.prathishtaOptions[index][0].name;
        const defaultPrathishtaId = this.prathishtaOptions[index][0].id;
        console.log(defaultPrathishta)
        this.vazhipadinfo.at(index).get('Prethista')?.setValue(defaultPrathishta);
        this.vazhipadinfo.at(index).get('PMid')?.setValue(defaultPrathishtaId);
      }
      // const selectedRow = this.vazhipadinfo.at(index);
      // selectedRow.get('Prathishta')?.setValue(res[0].PM_Name);
    },
    error:(err)=>{
      console.log("error in getting prathishta")
    }
  })
}

  // opne multiday open dialog box

  openMultiDayDialog(rowIndex: number): void {
    const selectedRow = this.vazhipadinfo.at(rowIndex) as FormGroup;
    const name = selectedRow.get('name')?.value || ''; // Get name from selected row
    const star = selectedRow.get('star')?.value || '';
    const dialogRef = this.dialog.open(MultidayitemsComponent, {
      width: '80%',
      maxWidth: '60vw',
      data: { rowIndex, name, star },
      // Optionally, you can pass data to the dialog component using the 'data' property
      // data: { anyData: 'you want to pass' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      const combinedData = result.combinedData;
      const formData = result.formData;
      if (formData) {
        const newQty = formData.days * formData.qty;
        const vazhDate = formData.startDate;
        this.vazhipadinfo.at(rowIndex).get('Qty')!.setValue(newQty);
        this.vazhipadinfo.at(rowIndex).get('VazhipadDate')!.setValue(vazhDate);
        // Check if devotees array has any items
        if (result.combinedData) {
          console.log(result.combinedData);
          this.addMultiDayBookedDetails(result.combinedData, rowIndex);
          // this.openMultiDayBookedDetails(combinedData);
        }
      }
    });
  }

  addMultiDayBookedDetails(combinedData: any[], rowIndex: number): void {
    const selectedRow = this.vazhipadinfo.at(rowIndex) as FormGroup;
    let multidaybookedDetailsArray = selectedRow.get(
      'multidaybookedDetails'
    ) as FormArray;

    // Check if multidaybookedDetailsArray is null and initialize if necessary
    // if (!multidaybookedDetailsArray) {
    //   multidaybookedDetailsArray = this.fb.array([]);
    //   selectedRow.setControl('multidaybookedDetails', multidaybookedDetailsArray);
    // }

    combinedData.forEach((item) => {
      const itemGroup = this.fb.group(item); // Create a FormGroup from the item object
      multidaybookedDetailsArray.push(itemGroup);
    });

    console.log(multidaybookedDetailsArray);
    console.log(this.form);
  }

  createMultiDayBookedDetailFormGroup(item: any): FormGroup {
    return this.fb.group({
      name: [item.name],
      star: [item.star],
      date: [item.date],
    });
  }

  openMultiDayBookedDetails(rowIndex: number) {
    const selectedRow = this.vazhipadinfo.at(rowIndex) as FormGroup;
    const multidaybookedDetailsArray = selectedRow.get(
      'multidaybookedDetails'
    ) as FormArray;
    console.log('arrrr' + multidaybookedDetailsArray.value);
    console.log(multidaybookedDetailsArray.value);
    console.log('arrrr');
    const dialogRef = this.dialog.open(MultidaybookeddetailsComponent, {
      width: '80vh',
      maxWidth: '50vw',
      data: { devoteedetails: multidaybookedDetailsArray.value }, // Pass the array values

      // Optionally, you can pass data to the dialog component using the 'data' property
      // data: { anyData: 'you want to pass' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Handle result if necessary
        console.log('Dialog result:', result);
      }
    });
  }

  // calculate amount
  updateAmount(row: FormGroup): void {
    const qty = row.get('Qty')?.value || 0;
    const rate = row.get('Rate')?.value || 0;
    const amount = qty * rate;
    row.get('Amount')?.setValue(amount);
    this.updateTotalAmount();
  }
  // total amount calculation
  updateTotalAmount(): void {
    this.totalAmount = this.vazhipadinfo.controls.reduce((sum, row) => {
      const amount = row.get('Amount')?.value || 0;
      return sum + amount;
    }, 0);
    this.eventService.setTotalAmount(this.totalAmount);
    this.vazhipadinfo.controls.forEach((row) => {
      row.get('TotalAmt')?.setValue(this.totalAmount);
    });
  }

  sendDataToApi(data: any) {
    console.log(data)
    const formattedData = this.formatDateFields(data);
    console.log(formattedData);
    this.masterservice.vazhipadBooking(formattedData).subscribe((res)=>{
      console.log(res);
    })
   
  }
  
  private formatDateFields(data: any): any {
    // if (data.vazhipadinfo && Array.isArray(data.vazhipadinfo)) {
    //   data.vazhipadinfo = data.vazhipadinfo.map((item:any) => {
    //     if (item.VazhipadDate) {
    //       item.VazhipadDate = this.dateFormat(new Date(item.VazhipadDate));
    //     }
    //     return item;
    //   });
    // }
    // return data;

    const formattedData = { ...data };

    if (formattedData.vazhipadinfo && Array.isArray(formattedData.vazhipadinfo)) {
      formattedData.vazhipadinfo = formattedData.vazhipadinfo.map((item: any) => {
        return {
          ...item,
          Slno: String(item.Slno),
          Vazhipad: String(item.Vazhipad),
          Vazhid: String(item.Vazhid),
          Name: String(item.Name),
          Star: String(item.Star),
          Prethista: String(item.Prethista),
          Qty: String(item.Qty),
          Rate: String(item.Rate),
          Amount: String(item.Amount),
          VazhipadDate: this.dateFormat(new Date(item.VazhipadDate)),
          TotalAmt: String(item.TotalAmt),
          
          Name2: String(item.Name2),
          Star2: String(item.Star2),
          Postal: String(item.Postal),
          PMid: String(item.PMid),
          Mday: String(item.Mday),
          NalBy: String(item.NalBy),
          Mmonth: String(item.Mmonth),
          
        };
      });
    }

    return formattedData;



  }


  // add row by key press

  handleTimeFieldKeyPress(event: KeyboardEvent, row: AbstractControl,i:number) {
    if (event.key === 'Enter') {
      const formGroupRow = row as FormGroup;
      if (formGroupRow.valid) {
        this.addRow(i);
      } else {
        alert(
          'Please fill in all required fields in the current row before adding a new row.'
        );
      }
    }
  }
}

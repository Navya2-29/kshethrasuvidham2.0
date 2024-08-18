import { vazhipad } from './../../../othervazhipad/othervazhipad.component';
import { ToastrService } from 'ngx-toastr';
import { VMList } from './../../../models/day-master.model';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
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
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
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
import { NumberDirective } from '../../../shared/directives/number/number.directive';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { NgxPrintModule } from 'ngx-print';

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
    NumberDirective,
    NgxPrintModule,
  ],
  templateUrl: './areareceipt.component.html',
  styleUrl: './areareceipt.component.css',
  providers: [DatePipe],
})
export class AreareceiptComponent implements OnInit {
  // private multidayService = inject(MultidayService);
  language: string[] = ['English', 'malayalam', 'Hindi'];
  form: FormGroup;
  row: FormArray;
  filteredOptions: any[] = [];
  nakshatham: any[];
  VMList: any[] = [];
  totalAmount: number = 0;
  autoCompleteFields: MatAutocomplete[] = [];
  clickReceived = false;
  today: Date;
  currentDate = new Date();
  prathishtaOptions: any[] = [];
  tomorrowDate: Date;
  dateToSet: string | null;
  singleMultiSelection: string[] = []; // To hold the radio button values
  multidayBooking: any[] = [];
  isDataSaved: boolean = false;
  indexForAutoComplete: number;
  printData: any;
  translatedVazhipad: string;
  seasonalDates: { fromDate: any; toDate: any } | null = null;
  allowedDays: number[] = [];
  filteredVazhipadTimeOptions: any[][] = [];
  readonlyDate: boolean = false;
  nearestAllowedDate: any;
  private subscription: Subscription;
  private masterservice = inject(MasterService);
  private eventService = inject(TotalAmountService);
  private notification = inject(ToastrService);
  private receiptPrintService = inject(ReceiptPrintService);
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private datePipe: DatePipe
  ) {
    this.form = this.fb.group({
      vazhipadinfo: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.getAllvazhipad();
    this.getNakshthram();
    // this.addRow(0);
    this.dateToSet = this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd');
    this.subscription = this.eventService.clickEvent$.subscribe(() => {
      this.clickReceived = true;
      // Handle the event here
      console.log('Click event received!');
      this.eventService.setSecondComponentData(this.form.value);
      const combinedData = this.eventService.getAllData();
      // this.sendDataToApi(combinedData);
      this.sendDataToApi(combinedData);
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
      Vazhipad: ['', [Validators.required]],
      Vazhid: [''],
      Name: ['', [Validators.required]],
      Star: ['28', [Validators.required]],
      Prethista: ['', [Validators.required]],
      Qty: [1, [Validators.required]],
      Rate: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          this.zeroRateValidator,
        ],
      ],
      Amount: [''],
      VazhipadDate: ['', [Validators.required],this.validateVazhipadDate],
      TotalAmt: [this.totalAmount],
      VTime: ['0', [Validators.required]],
      // multidaybookedDetails: this.fb.array([]),
      Name2: [''],
      Star2: ['28'],
      Postal: ['10'],
      PMid: ['1'],
      Mday: [''],
      NalBy: [''],
      Mmonth: [''],
      toDate: [{ disabled: true, value: '' }],
      multiname: [{ disabled: true, value: '' }],
      booking: [{ disabled: true, value: '' }],
      ratechange: [{ disabled: true, value: '' }],
      allowedDays: this.fb.array([]),
      VM_Receipt: [{ disabled: true, value: '' }],
      dateToSet: [''],
      seasonalDates: this.fb.group({
        fromDate: [''],
        toDate: [''],
      }),
    });
    row.get('Qty')?.valueChanges.subscribe(() => this.updateAmount(row));
    row.get('Rate')?.valueChanges.subscribe(() => this.updateAmount(row));
    row.get('VazhipadDate')?.valueChanges.subscribe(() => {
      this.checkVazhipadDate(row);
    });
    return row;
  }

  get vazhipadinfo(): FormArray {
    return this.form.get('vazhipadinfo') as FormArray;
  }

  checkVazhipadDate(row: FormGroup) {
   this.validateVazhipadDate(row)
    // const vmBooking = row.get('booking')?.value === 'Y' ? 'Y' : 'N';
    // console.log(vmBooking)
    // const enteredDate = new Date(row.get('VazhipadDate')?.value);
    // const currentDate = new Date(); // Current date without time
    // const tomorrowDate = new Date(currentDate);
    // tomorrowDate.setDate(currentDate.getDate() + 1);
    // if (vmBooking === 'N' && enteredDate < currentDate) {
    //   this.notification.error('The Vazhipad date must be today or a future date.');
    // } else if (vmBooking === 'Y' && enteredDate < tomorrowDate) {
    //   this.notification.error('The Vazhipad date must be tomorrow or a future date.');
    // }
  }

  zeroRateValidator(control: AbstractControl): ValidationErrors | null {
    const rate = control.value;
    if (rate === 0) {
      return { zeroRate: true };
    }
    return null;
  }

  addRow(index: number): void {
    if (index === -1 && this.vazhipadinfo.length === 0) {
      this.vazhipadinfo.push(this.createRow());
      this.setupAutocomplete(0);
      this.updateTotalAmount();
      return;
    }
    this.indexForAutoComplete = index;
    if (
      this.vazhipadinfo.length > 0 &&
      !this.vazhipadinfo.at(this.vazhipadinfo.length - 1).valid
    ) {
      //  this.notification.success("Plese fill the details");
      const row = this.vazhipadinfo.at(index) as FormGroup;
      //  row.markAllAsTouched();
      //   return;

      if (row.invalid) {
        if (row.get('Vazhipad')?.errors?.['required']) {
          this.notification.success('Please select a vazhipad');
        } else if (row.get('Vazhipad')?.errors?.['invalidVazhipad']) {
          this.notification.success('Please select a Valid vazhipad');
        } else if (row.get('Name')?.errors?.['required']) {
          this.notification.success('Please enter the Name');
        } else if (row.get('Star')?.errors?.['required']) {
          this.notification.success('Please select a Star');
        } else if (row.get('Prethista')?.errors?.['required']) {
          this.notification.success('Please select a Prethista');
        } else if (row.get('Qty')?.errors?.['required']) {
          this.notification.success('Please select a Qty');
        } else if (row.get('Rate')?.errors?.['required']) {
          this.notification.success('Please select a Rate');
        } else if (row.get('Rate')?.errors?.['pattern']) {
          this.notification.success('Enter a valid rate');
        } else if (row.get('Rate')?.errors?.['zeroRate']) {
          this.notification.success('Rate cannot be zero');
        } else if (row.get('VazhipadDate')?.errors?.['required']) {
          this.notification.success('Please select a VazhipadDate');
        }

        return; // Stop adding new row if current row is invalid
      }
    }
    console.log(index);
    const currentRow = this.vazhipadinfo.at(index) as FormGroup;
    const currentName = currentRow.get('Name')?.value;
    const currentStar = currentRow.get('Star')?.value;
    const newRow = this.createRow();
    newRow.patchValue({
      Name: currentName,
      Star: currentStar,
    });

    this.vazhipadinfo.insert(index + 1, newRow);
    this.setupAutocomplete(index + 1);
    this.updateTotalAmount();
  }

  removeRow(index: number) {
    console.log(index + 'Sssssssssssssssssssss');

    if (this.vazhipadinfo.length > 1) {
      this.vazhipadinfo.removeAt(index);
      this.updateTotalAmount();
      this.updateSlno();
      this.notification.success('Data deleted successfully');
      this.setupAutocomplete(this.indexForAutoComplete);
      this.removeMultidayData(index);
    } else {
      this.resetForm();
      this.removeMultidayData(index);
    }
  }
  removeMultidayData(index: number): void {
    if (index >= 0 && index < this.multidayBooking.length) {
      this.multidayBooking.splice(index, 1);
      // this.notification.success("Multiday booking data deleted successfully");
    }
  }

  // formatting date in dd-mm-yyyy
  dateFormat(date: Date): any {
    return this.datePipe.transform(date, 'dd-MM-yyyy') || '';
  }
  private dateFormatd(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
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
    const normalizedVazhipadMal = value.normalize('NFC');
    return this.VMList.filter(
      (option) =>
        option.VM_Name.toLowerCase().includes(filterValue) ||
        option.VM_Code.toLowerCase().includes(filterValue) ||
        option.VM_RName?.normalize('NFC').includes(normalizedVazhipadMal)
    );
  }

  getAllvazhipad() {
    this.masterservice.getAllActiveVazhipad().subscribe((data) => {
      this.VMList = data.map((item) => ({
        VM_Id: item.VM_Id,
        VM_Name: item.VM_Name,
        VM_Code: item.VM_Code,
        VM_RName: item.VM_RName,
      }));
    });
    this.addRow(-1);
  }

  getNakshthram() {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterservice.getStarData(payLoad).subscribe((res) => {
      this.nakshatham = res;
      console.log(this.nakshatham);
      // this.autoCompleteForStar();
    });
  }

  vazhipadValidator(control: AbstractControl): ValidationErrors | null {
    const vazhipad = control.value;
    const vmExists = this.VMList.some((vm) => vm.VM_Name === vazhipad);
    if (!vmExists) {
      return { invalidVazhipad: true };
    }
    return null;
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
    { id: '3', name: 'AfterNoon' },
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
      this.getDatamasterdateCheck(selectedVazhipadItem.VM_Id,index);
    this.getSeasnalalVazhipadData(selectedVazhipadItem.VM_Id,index);
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
        if (res[0].VM_Amt != 0) {
          selectedRow.get('Rate')?.setValue(res[0].VM_Amt);
        } else {
          selectedRow.get('Rate')?.setValue('');
        }
        // selectedRow.get('Rate')?.setValue(res[0].VM_Amt);
        selectedRow.get('multiname')?.setValue(res[0].VM_MultiName);
        selectedRow.get('booking')?.setValue(res[0].VM_Booking);
        selectedRow.get('VM_Receipt')?.setValue(res[0].VM_Receipt);
        selectedRow.get('ratechange')?.setValue(res[0].VM_Rate_Change);
        selectedRow.get('VTime')?.setValue(res[0].VM_Time);
        this.setVazhipadDate(index);
        // const booking = selectedRow.get('booking')?.value;
        // const receipt=selectedRow.get('VM_Receipt')?.value;
        // const allowedDays = selectedRow.get('allowedDays')?.value as number[] || [];
        // console.log(allowedDays +"fffffffffffffffffffffff")
        // this.tomorrowDate = new Date(this.currentDate);
        // this.tomorrowDate.setDate(this.currentDate.getDate() + 1);

        // this.dateToSet =
        //   isVMBooking === 'Y'
        //     ? this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd')
        //     : this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');
        // selectedRow.get('VazhipadDate')?.setValue(this.dateToSet);

        // if (receipt === 'Y' && booking === 'N') {
        // Case 1: Receipt is "Y" and Booking is "N"

        // if (allowedDays.length === 0) {

        // Set vazhipadDate to today's date
        // selectedRow.get('VazhipadDate')?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
        // selectedRow.get('dateToSet')?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
        // }
        // } else if (booking === 'Y' && receipt === 'N') {
        // selectedRow.get('VazhipadDate')?.setValue(this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd'));
        // selectedRow.get('dateToSet')?.setValue(this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd'));
        // }

        this.selectedVazhipadPrathistaDetails(vazhipadcode, index);
this.setVazhipadDate(index)
        console.log(selectedRow);
      });
  }






  setVazhipadDate(index: number) {
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    const booking = selectedRow.get('booking')?.value;
    const receipt = selectedRow.get('VM_Receipt')?.value;
    const allowedDays =
      (selectedRow.get('allowedDays')?.value as number[]) || [];
      const seasonaldays =
      selectedRow.get('seasonalDates')?.value ;
    console.log(allowedDays + 'fffffffffffffffffffffff');
    this.tomorrowDate = new Date(this.currentDate);
    this.tomorrowDate.setDate(this.currentDate.getDate() + 1);

    if (receipt === 'Y' && booking === 'N') {
      // Case 1: Receipt is "Y" and Booking is "N"

      // if (allowedDays.length === 0) {

      // Set vazhipadDate to today's date
      selectedRow
        .get('VazhipadDate')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
      // }
    } else if (booking === 'Y' && receipt === 'N') {
      selectedRow
        .get('VazhipadDate')
        ?.setValue(this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd'));
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd'));
    }else if(allowedDays?.length>0){
      if (this.nearestAllowedDate) {

            selectedRow.get('VazhipadDate')?.setValue(this.datePipe.transform(this.nearestAllowedDate,'yyyy-MM-dd')); // YYYY-MM-DD format
            selectedRow.get('dateToSet')?.setValue(this.datePipe.transform(this.nearestAllowedDate, 'yyyy-MM-dd'));
          }


    }else if(seasonaldays){
      selectedRow.get('VazhipadDate')?.setValue(seasonaldays.fromDate);
    }
  }

  // fetch parthishta details
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  selectedVazhipadPrathistaDetails(vazhipadcode: any, index: number) {
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    this.masterservice.getVazhipadByCodeForDiety(vazhipadcode).subscribe({
      next: (res: any) => {
        console.log(res);
        this.prathishtaOptions[index] = res.map((item: any) => ({
          id: item.PM_ID,
          name: item.PM_Name,
        }));
        const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
        if (this.prathishtaOptions[index].length > 0) {
          console.log(this.prathishtaOptions[index]);
          const defaultPrathishta = this.prathishtaOptions[index][0].name;
          const defaultPrathishtaId = this.prathishtaOptions[index][0].id;
          console.log(defaultPrathishta);
          this.vazhipadinfo
            .at(index)
            .get('Prethista')
            ?.setValue(defaultPrathishta);
          this.vazhipadinfo
            .at(index)
            .get('PMid')
            ?.setValue(defaultPrathishtaId);

          selectedRow
            .get('Prethista')
            ?.valueChanges.subscribe((selectedPrathishta) => {
              const selectedPrathishtaObj = this.prathishtaOptions[index].find(
                (option: any) => option.name === selectedPrathishta
              );
              if (selectedPrathishtaObj) {
                selectedRow.get('PMid')?.setValue(selectedPrathishtaObj.id); // Set PMid based on selected Prathishta
              }
            });
        }
        // const selectedRow = this.vazhipadinfo.at(index);
        // selectedRow.get('Prathishta')?.setValue(res[0].PM_Name);
      },
      error: (err) => {
        console.log('error in getting prathishta');
      },
    });

   
  }

  // opne multiday open dialog box
  openMultiDayDialog(rowIndex: number): void {
    const dialogRef = this.dialog.open(MultidayitemsComponent, {
      width: '80%',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dialog closed with data:', result);
        // this.handleDialogData(result);

        this.handleMultiDayBookingResult(result, rowIndex);
      }
    });
  }

  // to show multi day booked details
  openMultiDayBookedDetails(rowIndex: number) {
    const dialogRef = this.dialog.open(MultidaybookeddetailsComponent, {
      width: '80vh',
      maxWidth: '50vw',
      data: this.multidayBooking[rowIndex], // Pass the array values
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleMultiDayBookingResult(result, rowIndex);
      }
    });
  }

  private handleMultiDayBookingResult(result: any, rowIndex: number): void {
    const row = this.vazhipadinfo.at(rowIndex) as FormGroup;
    console.log(row);
    console.log(result[0]);

    let lastIndex = result.length - 1;
    const data = result[0];
    // console.log(data.Prethista);
    // row.get('Prethista')?.setValue(data.Prethista)
    // this.prathishtaOptions[rowIndex]=data.Prethista
    this.multidayBooking[rowIndex] = result;
    row.patchValue({
      Vazhipad: data.Vazhipad,
      Vazhid: data.Vazhid,
      Prethista: data.Prethista,
      Qty: data.Qty * result.length,
      Rate: data.Rate,
      VazhipadDate: this.formatDate(data.VazhipadDate),
      TotalAmt: this.totalAmount,
      toDate: this.formatDate(result[lastIndex].VazhipadDate),
      PMid: data.PMid,
      Mday: data.Mday,
      NalBy: data.NalBy,
      Mmonth: data.Mmonth,
      Name: data.Name,
      Star: data.Star,
      Name2: data.Name2,
      Star2: data.Star2,
      // Add other fields if needed
    });
  }

  convertToDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Months are 0-based in JavaScript
  }

  // Function to format the date
  formatDates(dateStr: string): string {
    const date = this.convertToDate(dateStr);
    return this.datePipe.transform(date, 'yyyy-mm-dd') || '';
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

  private flattenMultiDayBooking(): any[] {
    return this.multidayBooking.flat();
  }
  // api data send
  sendDataToApi(data: any) {
    if (this.form.invalid) {
      this.notification.error('Please fill out all required fields correctly.');

      return;
    }
    console.log('ffffffffffffffffffff');
    console.log(this.multidayBooking);
    console.log(data);

    const flattenedData = this.flattenMultiDayBooking();
    console.log('Flattened Data:', flattenedData);

    const vazhipadinfo = data.vazhipadinfo || []; // Ensure vazhipadinfo is an array
    const combinedVazhipadinfo = [...vazhipadinfo, ...flattenedData];
    this.printData = vazhipadinfo;
    const updatedData = {
      ...data,
      vazhipadinfo: combinedVazhipadinfo,
    };
    console.log(updatedData);
    const formattedData = this.formatDateFields(updatedData);
    console.log(formattedData);

    this.masterservice.vazhipadBooking(formattedData).subscribe((res: any) => {
      console.log(res);
      if (res) {
        if (res.RespStatus === 'I') {
          this.notification.success(res.RespMsg);
          this.receiptPrintService.setReceiptData(formattedData);
          this.resetForm();

          this.masterservice.getLastBillNumber().subscribe({
            next: (lastbillno) => {
              const lastBillNumber = lastbillno[0].billno;
              const currentBillnumber = lastBillNumber + 1;
              this.masterservice
                .updateLastBillNumber(currentBillnumber)
                .subscribe({
                  next: (data) => {
                    this.eventService.notifytheupdateLastbillnumber();
                    console.log(data);
                  },
                  error: (err) => {
                    console.log(err);
                  },
                });
            },
          });
          this.isDataSaved = true;
          // this.printReceipt();
        }
      } else {
        this.notification.error('Please check your connection and try agin');
      }
    });
  }

  resetForm() {
    this.form.reset();
    this.vazhipadinfo.clear();
    this.addRow(-1); // Add an initial row after resetting
    this.updateTotalAmount();
    this.updateSlno();
  }

  private formatDateFields(data: any): any {
    const formattedData = { ...data };
    if (
      formattedData.vazhipadinfo &&
      Array.isArray(formattedData.vazhipadinfo)
    ) {
      formattedData.vazhipadinfo = formattedData.vazhipadinfo.map(
        (item: any) => {
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
        }
      );
    }
    return formattedData;
  }

  // add row by key press

  handleTimeFieldKeyPress(
    event: KeyboardEvent,
    row: AbstractControl,
    i: number
  ) {
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

  showValidationErrors(row: FormGroup): void {
    Object.keys(row.controls).forEach((key) => {
      const controlErrors: ValidationErrors = row.get(key)?.errors || {};
      if (controlErrors) {
        Object.keys(controlErrors).forEach((errorKey) => {
          switch (errorKey) {
            case 'required':
              this.notification.success(`${key} is required.`);
              break;
            case 'pattern':
              this.notification.success(`Invalid pattern for ${key}.`);
              break;
            case 'zeroRate':
              this.notification.success(`Rate cant be Zero`);
              break;
            // Add more cases as needed for other validators
          }
        });
      }
    });
  }

  getSeasnalalVazhipadData(vid: string, index: number) {
    console.log(vid + ' ssssssssss');
    this.masterservice.getSeasonalVazhipadDateCheck(vid).subscribe({
      next: (data) => {
        const row = this.vazhipadinfo.at(index) as FormGroup;

        if (
          data &&
          data.length > 0 &&
          data[0].VS_FromDate &&
          data[0].VS_ToDate
        ) {
          // Parse the dates and ensure they are valid
          const fromDate = new Date(data[0].VS_FromDate);
          const toDate = new Date(data[0].VS_ToDate);

          if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
            this.seasonalDates = {
              fromDate: this.datePipe.transform(fromDate, 'yyyy-MM-dd'),
              toDate: this.datePipe.transform(toDate, 'yyyy-MM-dd'),
            };

            // Update seasonal dates in the specific row
            row.get('seasonalDates')?.patchValue(this.seasonalDates);

            // Set vazhipadDate to seasonal 'fromDate'
            // row.get('VazhipadDate')?.setValue(this.seasonalDates.fromDate);
          }
          // else {
          // Handle invalid date formats
          // this.seasonalDates = { fromDate: '', toDate: '' };
          // row.get('seasonalDates')?.patchValue(this.seasonalDates);
          // }
        } else {
          // Handle case when data is empty or dates are not present
          this.seasonalDates = { fromDate: '', toDate: '' };
          row.get('seasonalDates')?.patchValue(this.seasonalDates);
        }
      },
      error: (err) => {
        console.error('Error fetching seasonal vazhipad data:', err);
        // Handle error case by resetting seasonal dates
        const row = this.vazhipadinfo.at(index) as FormGroup;
        this.seasonalDates = { fromDate: '', toDate: '' };
        row.get('seasonalDates')?.patchValue(this.seasonalDates);
      },
    });
  }

  getDatamasterdateCheck(vid: string, index: number) {
    const row = this.vazhipadinfo.at(index) as FormGroup;

    this.masterservice.getDayMastervazhipaddateCheck(vid).subscribe({
      next: (data) => {
        // Check the API response
        console.log('API Response:', data);

        // Map the data to get the allowed days
        this.allowedDays = data.map((day) => day.Day);
        console.log('Allowed Days:', this.allowedDays);

        // Ensure the allowedDays control is an array
        const allowedDaysControl = row.get('allowedDays') as FormArray;
        if (allowedDaysControl) {
          allowedDaysControl.clear(); // Clear existing values
          this.allowedDays.forEach((day) =>
            allowedDaysControl.push(this.fb.control(day))
          );
          console.log('Updated Row:', row);
          this.nearestAllowedDate = this.getNearestAllowedDate(
            new Date(),
            this.allowedDays
          );
          console.log(this.nearestAllowedDate + 'JJJJJJJJJJJJJ');
          //   if (this.nearestAllowedDate) {

          //     row.get('VazhipadDate')?.setValue(this.datePipe.transform(this.nearestAllowedDate,'yyyy-MM-dd')); // YYYY-MM-DD format
          //     row.get('dateToSet')?.setValue(this.datePipe.transform(this.nearestAllowedDate, 'yyyy-MM-dd'));
          //   }
        } else {
          console.error('Allowed Days control is missing.');
        }
      },
      error: (err: any) => {
        console.error('Error fetching allowed days:', err);
      },
    });
  }

  validateVazhipadDate(
    control: AbstractControl
  ): Observable<{ [key: string]: any } | null> {
    console.log('Validator called');

    const row = control.parent as FormGroup;
    if (!row) return of(null);

    const allowedDays = (row.get('allowedDays')?.value as number[]) || [];
    const selectedDate = new Date(control.value);
    const selectedDayValue = this.getCustomDayValue(selectedDate);

    const seasonalDates = row.get('seasonalDates')?.value as {
      fromDate: string;
      toDate: string;
    } | null;
    const seasonalFromDate = seasonalDates
      ? new Date(seasonalDates.fromDate)
      : null;
    const seasonalToDate = seasonalDates
      ? new Date(seasonalDates.toDate)
      : null;
    const isSeasonalValid =
      !seasonalDates ||
      (seasonalFromDate &&
        seasonalToDate &&
        selectedDate >= seasonalFromDate &&
        selectedDate <= seasonalToDate);

    if (allowedDays.length > 0 && !allowedDays.includes(selectedDayValue)) {
      // Get the allowed day names instead of nearest date
      const allowedDayNames = this.getAllowedDayNames(allowedDays);

      // Show an error notification with the allowed day names
      this.notification.error(
        `Selected date is not allowed. Allowed days are: ${allowedDayNames.join(
          ', '
        )}`,
        'Validation Error',
        {
          timeOut: 5000,
          closeButton: true,
        }
      );

      return of({ invalidDay: true });
    }

    if (seasonalDates && !isSeasonalValid) {
      // Show an error notification if the date is not within the seasonal range
      this.notification.error(
        `Selected date is not valid for this vazhipad. The valid range is from ${this.datePipe.transform(
          seasonalFromDate,
          'yyyy-MM-dd'
        )} to ${this.datePipe.transform(seasonalToDate, 'yyyy-MM-dd')}`,
        'Validation Error',
        {
          timeOut: 5000,
          closeButton: true,
        }
      );

      return of({ invalidSeasonalDate: true });
    }

    return of(null);
  }

  getAllowedDayNames(allowedDays: number[]): string[] {
    const dayNamesMap: { [key: number]: string } = {
      1: 'Sunday',
      2: 'Monday',
      3: 'Tuesday',
      4: 'Wednesday',
      5: 'Thursday',
      6: 'Friday',
      7: 'Saturday',
    };

    return allowedDays.map((day) => dayNamesMap[day] || '');
  }

  getCustomDayValue(date: Date): number {
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    return this.dayMapping[dayOfWeek] || 0;
  }
  private dayMapping: { [key: number]: number } = {
    0: 1, // Sunday
    1: 2, // Monday
    2: 3, // Tuesday
    3: 4, // Wednesday
    4: 5, // Thursday
    5: 6, // Friday
    6: 7, // Saturday
  };

  getNearestAllowedDate(date: Date, allowedDays: number[]): Date {
    const dayOfWeek = date.getDay();
    const allowedDates = allowedDays.map((dayValue) => {
      const diff = (dayValue - this.dayMapping[dayOfWeek] + 7) % 7;
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + diff
      );
    });

    return allowedDates.reduce((nearest, current) =>
      Math.abs(current.getTime() - date.getTime()) <
      Math.abs(nearest.getTime() - date.getTime())
        ? current
        : nearest
    );
  }

  // Function to return today's date in YYYY-MM-DD format
  getTodayDate(): string {
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    return todayDate;
  }

  // Function to return tomorrow's date in YYYY-MM-DD format
  getTomorrowDate(): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Add 1 day to get tomorrow
    const tomorrowDate = tomorrow.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    return tomorrowDate;
  }

  getDefaultDate(): string {
    // Set default date logic (e.g., today’s date or any specific logic)
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    return defaultDate;
  }
}

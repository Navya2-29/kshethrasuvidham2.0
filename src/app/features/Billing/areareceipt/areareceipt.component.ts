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
import { DatePipe, formatDate } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
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
      VazhipadDate: ['', [Validators.required]],
      TotalAmt: [this.totalAmount],
      VTime: ['0', [Validators.required]],
      // multidaybookedDetails: this.fb.array([]),
      Name2: [''],
      Star2: ['28'],
      Postal: ['0'],
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
    console.log('Form Group:', row);

    // Retrieve values from the form
    const vazhipadDateStr = row.get('VazhipadDate')?.value;
    const fromDateStr = row.get('seasonalDates.fromDate')?.value;
    const toDateStr = row.get('seasonalDates.toDate')?.value;
    if (fromDateStr && toDateStr) {
      console.log('Vazhipad Date String:', vazhipadDateStr);
      console.log('From Date String:', fromDateStr);
      console.log('To Date String:', toDateStr);

      // Convert string dates to Date objects
      const vazhipadDate = vazhipadDateStr ? new Date(vazhipadDateStr) : null;
      const fromDate = fromDateStr ? new Date(fromDateStr) : null;
      const toDate = toDateStr ? new Date(toDateStr) : null;

      console.log('Parsed Vazhipad Date:', vazhipadDate);
      console.log('Parsed From Date:', fromDate);
      console.log('Parsed To Date:', toDate);

      // Validate date ranges
      if (vazhipadDate && fromDate && toDate) {
        if (vazhipadDate < fromDate || vazhipadDate > toDate) {
          console.log('Date is out of range');
          row.get('VazhipadDate')?.setErrors({ invalidDateRange: true });
          this.notification.error(
            `Vazhipad date must be within ${
              fromDate.toISOString().split('T')[0]
            } - ${toDate.toISOString().split('T')[0]}`
          );
        } else {
          console.log('Date is within range');
          row.get('VazhipadDate')?.setErrors(null);
        }
      } else {
        console.log('Date values are invalid or missing');
        row.get('VazhipadDate')?.setErrors({ invalidDateRange: true });
      }
    }
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

  private _filter(value: string | null | undefined): any[] {
    // Handle null or undefined value
    if (value === null || value === undefined) {
      return []; // or handle as appropriate for your use case
    }

    const filterValue = value.toLowerCase();
    const normalizedValue = value.normalize('NFC');

    return this.VMList.filter((option) => {
      // Ensure properties accessed on option are not null or undefined
      const vmName = option.VM_Name ? option.VM_Name.toLowerCase() : '';
      const vmCode = option.VM_Code ? option.VM_Code.toLowerCase() : '';
      const vmRName = option.VM_RName ? option.VM_RName.normalize('NFC') : '';

      return (
        vmName.includes(filterValue) ||
        vmCode.includes(filterValue) ||
        vmRName.includes(normalizedValue)
      );
    });
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
      this.getSeasnalalVazhipadData(selectedVazhipadItem.VM_Id, index);
      this.getDatamasterdateCheck(selectedVazhipadItem.VM_Id, index);
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

        this.selectedVazhipadPrathistaDetails(vazhipadcode, index);

        this.setVazhipadDate(index);
        console.log(selectedRow);
      });
  }

  setVazhipadDate(index: number) {
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    const booking = selectedRow.get('booking')?.value;
    const receipt = selectedRow.get('VM_Receipt')?.value;
    const vazhipadId = selectedRow.get('Vazhid')?.value;
    const allowedDays =
      (selectedRow.get('allowedDays')?.value as number[]) || [];
    const seasonaldays = selectedRow.get('seasonalDates')?.value;
    console.log(allowedDays + 'fffffffffffffffffffffff');
    this.tomorrowDate = new Date(this.currentDate);
    this.tomorrowDate.setDate(this.currentDate.getDate() + 1);
    const fromDate = seasonaldays ? seasonaldays.fromDate : null;
    if (receipt === 'Y' && booking === 'N') {
      selectedRow
        .get('VazhipadDate')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
      // }
    } else if (booking === 'Y' && receipt === 'N'  ) {
      selectedRow
        .get('VazhipadDate')
        ?.setValue(this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd'));
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd'));
    } else if (booking === 'N' && receipt === 'N' ) {
      selectedRow
        .get('VazhipadDate')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
    } 
    
    
    
    else if (fromDate) {
      selectedRow.get('VazhipadDate')?.setValue(fromDate);
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(fromDate, 'yyyy-MM-dd'));
    }
  }

  // fetch parthishta details
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // fetch prathista detasils
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
    console.log(data.Prethista);
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
    let isFormValid = true; // Initialize form validity

    // Iterate through each form group (row) in the vazhipadinfo FormArray
    this.vazhipadinfo.controls.forEach((row) => {
      // Mark all controls in this row as touched to trigger validation styles
      row.markAllAsTouched();
  
      // Check if the current row is invalid
      if (row.invalid) {
        isFormValid = false; // Set form validity to false if any row is invalid
  
        // Display validation messages for each field based on its errors
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
          this.notification.success('Please enter a Qty');
        } else if (row.get('Rate')?.errors?.['required']) {
          this.notification.success('Please enter a Rate');
        } else if (row.get('Rate')?.errors?.['pattern']) {
          this.notification.success('Enter a valid rate');
        } else if (row.get('Rate')?.errors?.['zeroRate']) {
          this.notification.success('Rate cannot be zero');
        } else if (row.get('VazhipadDate')?.errors?.['required']) {
          this.notification.success('Please select a VazhipadDate');
        }
  
        // Stop further validation if a row is found to be invalid
        return;
      }
    });
  
    // If the form is invalid, do not proceed with the API call
    if (!isFormValid) {
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

  // form reset
  resetForm() {
    this.form.reset();
    this.vazhipadinfo.clear();
    this.addRow(-1); // Add an initial row after resetting
    this.updateTotalAmount();
    this.updateSlno();
  }

  // format the data based apiformat
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

  // add row by enter key press

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

  // show validatin error
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

  // getseasonal vazhipad data
  getSeasnalalVazhipadData(vid: string, index: number) {
    console.log(vid + ' ssssssssss');
    this.masterservice.getSeasonalVazhipadDateCheck(vid).subscribe({
      next: (data) => {
        console.log(data);

        // Check if the response data is empty or not
        if (data && data.length > 0) {
          const seasonalDates = {
            fromDate: data[0].VS_FromDate,
            toDate: data[0].VS_ToDate,
          };
          console.log(seasonalDates);

          const row = this.vazhipadinfo.at(index) as FormGroup;
          const formattedFromDate = this.datePipe.transform(
            seasonalDates.fromDate,
            'yyyy-MM-dd'
          );
          const formattedToDate = this.datePipe.transform(
            seasonalDates.toDate,
            'yyyy-MM-dd'
          );

          // Update the form with the fetched seasonal dates
          row.get('seasonalDates')?.patchValue({
            fromDate: formattedFromDate,
            toDate: formattedToDate,
          });

          this.setVazhipadDate(index);

          console.log(row);
        } else {
          // Handle the case when data is empty
          console.warn('No seasonal data available for the provided ID');
          const row = this.vazhipadinfo.at(index) as FormGroup;
          row.get('seasonalDates')?.patchValue({ fromDate: '', toDate: '' });
          row.get('vazhipadDate')?.patchValue('');
          // Optionally, show a notification or alert to inform the user
        }
      },
      error: (err) => {
        console.error('Error fetching seasonal vazhipad data:', err);
        // Handle error case by resetting seasonal dates
        const row = this.vazhipadinfo.at(index) as FormGroup;
        row.get('seasonalDates')?.patchValue({ fromDate: '', toDate: '' });
        row.get('vazhipadDate')?.patchValue('');
        // Optionally, show a notification or alert to inform the user
        this.notification.error(
          'Error fetching seasonal data. Please try again later.'
        );
      },
    });
  }

  // get the day master vazhipad data
  getDatamasterdateCheck(vid: string, index: number) {
    const row = this.vazhipadinfo.at(index) as FormGroup;

    this.masterservice.getDayMastervazhipaddateCheck(vid).subscribe({
      next: (data) => {
        // Extract only the 'Day' field from each object in the response
        console.log(data);
        const allowedDays = data.map((item: any) => item.Day);
        console.log(allowedDays);
        // Get the 'allowDays' FormArray from the current row
        const allowDaysFormArray = row.get('allowedDays') as FormArray;

        // Clear the previous allowed days in the FormArray
        while (allowDaysFormArray.length) {
          allowDaysFormArray.removeAt(0);
        }

        // Push the extracted 'Day' values into the 'allowDays' FormArray
        allowedDays.forEach((day: number) => {
          allowDaysFormArray.push(this.fb.control(day));
        });

        console.log('Allowed Days:', allowedDays);
        console.log(row);
      },
      error: (err) => {
        console.error('Error fetching day master data:', err);
      },
    });
  }

  checkDayBasedVazhipadDate(row: FormGroup): void {
    const allowedDays = row.get('allowedDays')?.value as number[];
    const vazhipadDate = row.get('VazhipadDate')?.value;

    if (allowedDays && vazhipadDate) {
      const dateToCheck = new Date(vazhipadDate);
      const dayOfWeek = dateToCheck.getDay(); // Sunday: 0, Monday: 1, etc.

      if (!allowedDays.includes(dayOfWeek + 1)) {
        // Adjusting dayOfWeek to match your numbering
        this.notification.error(
          'Selected VazhipadDate is not on an allowed day.'
        );
        row.get('VazhipadDate')?.setValue(''); // Optionally reset the date
      }
    }
  }
}

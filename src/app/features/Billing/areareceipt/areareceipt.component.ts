import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, formatDate } from '@angular/common';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';

import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
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
import { ConfirmationDialogComponent } from '../../../shared/component/confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BillingViaMobilenumberComponent } from '../billing-via-mobilenumber/billing-via-mobilenumber.component';
import { AuthService } from '../../../core/auth/service/auth.service';

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
    MatIconModule,
    MatRadioModule,
    UpperCaseDirective,
    TranslateModule,
    NumberDirective,
  ],
  templateUrl: './areareceipt.component.html',
  styleUrl: './areareceipt.component.css',
  providers: [DatePipe],
})
export class AreareceiptComponent implements OnInit {
  form: FormGroup;
  row: FormArray;
  filteredOptions: any[] = [];
  starFilteredOption: any[] = [];
  prathistaFilteredOption: any[] = [];
  nakshatham: any[] = [];
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
  filteredStarOptions: Observable<string[]>;
  billNumberFormatDate: string;
  lockTableLastbillNumber: number;
  generatedCurrentBillnumber: string;
  selectedVazhipadItem: any;
  CounterId: string | null;
  cancelFlag: boolean = false;
  nameStarArray: any[];
  singleorMultiDay: boolean;
  input1 = '';
  input2 = '';
  input3 = '';
  @ViewChildren('nameInput') nameInputs!: QueryList<ElementRef>;
  @ViewChild('firstInput') firstInputElement!: ElementRef;
  @ViewChildren('inputRef') inputRefs: QueryList<ElementRef>;
  lang: string | null;
  role: string | null;
  selectedStarData: any;
  lastEnterTime = 0; // Variable to track the time of the last Enter press
  doubleEnterThreshold = 500; // Time threshold in milliseconds to consider as double press
  @ViewChild('vTimeSelect', { static: false }) vTimeSelect!: ElementRef;
  devoteeSearchMobileNumber: string | null;
  private subscription: Subscription;
  private masterservice = inject(MasterService);
  private eventService = inject(TotalAmountService);
  private notification = inject(ToastrService);
  private receiptPrintService = inject(ReceiptPrintService);
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private router: Router,
    private ts: TranslateService,
    private authService: AuthService
  ) {
    this.CounterId = localStorage.getItem('counterId');
    this.role = localStorage.getItem('Role');
    this.billNumberFormatDate = this.getCurrentDateMMYY();
    this.lang = localStorage.getItem('Language') || 'en';
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
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

    this.receiptPrintService.mobileNumber$.subscribe((data: any) => {
      this.devoteeSearchMobileNumber = data?.mobile;
      console.log('Mobile number received:', this.devoteeSearchMobileNumber);
      if (this.devoteeSearchMobileNumber) {
        this.openBillingDialog(data);
      }
      // else{
      //   this.notification.error("Please enter valid Mobile number and try again")
      // }
    });
  }

  ngOnDestroy() {
    // Prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onBack() {
    this.router.navigate(['/front']);
  }

  createRow(): FormGroup {
    const row = this.fb.group({
      Slno: [''],
      Vazhipad: ['', [Validators.required, this.vazhipadValidator.bind(this)]],
      Vazhid: [''],
      Name: ['', [Validators.required]],
      Star: ['', [Validators.required]],
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
      Name2: [''],
      Star2: [''],
      Postal: ['0'],
      PMid: ['1'],
      Mday: [''],
      NalBy: [''],
      Mmonth: [''],
      starName: [''],
      FromDate: [''],
      ToDate: [''],
      SearchBy: [''],
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
      blockingDates: this.fb.group({
        dates: this.fb.array([]),
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
    // Retrieve values from the form
    console.log(row, 'datacheck bocking');
    const vazhipadDateStr = row.get('VazhipadDate')?.value;
    const fromDateStr = row.get('seasonalDates.fromDate')?.value;
    const toDateStr = row.get('seasonalDates.toDate')?.value;
    const blockingDatesArray = row.get('blockingDates.dates')?.value || [];
    const allowedDaysArray: string[] = row.get('allowedDays')?.value || [];
    if (fromDateStr && toDateStr) {
      // Convert string dates to Date objects
      const vazhipadDate = vazhipadDateStr ? new Date(vazhipadDateStr) : null;
      const fromDate = fromDateStr ? new Date(fromDateStr) : null;
      const toDate = toDateStr ? new Date(toDateStr) : null;

      // Validate date ranges
      if (vazhipadDate && fromDate && toDate) {
        if (vazhipadDate < fromDate || vazhipadDate > toDate) {
          row.get('VazhipadDate')?.setErrors({ invalidDateRange: true });
          this.notification.error(
            `Vazhipad date must be within ${
              fromDate.toISOString().split('T')[0]
            } - ${toDate.toISOString().split('T')[0]}`
          );
        } else {
          row.get('VazhipadDate')?.setErrors(null);
        }
      } else {
        row.get('VazhipadDate')?.setErrors({ invalidDateRange: true });
      }
    } else if (vazhipadDateStr && blockingDatesArray.length > 0) {
      const vazhipadDate = vazhipadDateStr ? new Date(vazhipadDateStr) : null;
      const formattedVazhipadDate = this.datePipe.transform(
        vazhipadDateStr,
        'yyyy-MM-dd'
      );

      // const fromDate = fromBlckDate ? new Date(fromBlckDate) : null;
      // const toDate = toBlckDate ? new Date(toBlckDate) : null;

      // Validate date ranges
      if (blockingDatesArray.includes(formattedVazhipadDate)) {
        // Set error if the date is blocked
        row.get('VazhipadDate')?.setErrors({ invalidBlockedDate: true });
        this.notification.error(
          `The selected Vazhipad date (${formattedVazhipadDate}) is blocked.`
        );
      } else {
        // Clear errors if the date is valid
        row.get('VazhipadDate')?.setErrors(null);
      }
    } else if (vazhipadDateStr && allowedDaysArray.length > 0) {
      const vazhipadDate = new Date(vazhipadDateStr);

      // Get the day name of the selected date
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const selectedDayName = dayNames[vazhipadDate.getDay()];
      console.log(selectedDayName, 'selectedDayName');

      // Check if selected day is in allowedDaysArray
      if (allowedDaysArray.includes(selectedDayName)) {
        row.get('VazhipadDate')?.setErrors(null); // Clear errors if the day is valid
      } else {
        row.get('VazhipadDate')?.setErrors({ invalidDay: true });
        this.notification.error(
          `The selected Vazhipad date (${vazhipadDateStr}) falls on ${selectedDayName}, which is not allowed.`
        );
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
      this.setupStarAutocomplete(0);
      this.updateTotalAmount();
      return;
    }
    this.indexForAutoComplete = index;
    if (
      this.vazhipadinfo.length > 0 &&
      !this.vazhipadinfo.at(this.vazhipadinfo.length - 1).valid
    ) {
      const row = this.vazhipadinfo.at(index) as FormGroup;

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

    const currentRow = this.vazhipadinfo.at(index) as FormGroup;
    const currentName = currentRow.get('Name')?.value;
    const currentStar = currentRow.get('Star')?.value;
    const newRow = this.createRow();
    newRow.patchValue({
      Name: currentName,
      Star: currentStar,
      starName: this.getStarbyId(currentStar),
    });

    this.vazhipadinfo.insert(index + 1, newRow);
    this.setupAutocomplete(index + 1);
    this.setupStarAutocomplete(index + 1);
    this.updateTotalAmount();
    setTimeout(() => {
      this.focusOnNewRow(); // Focus on the newly created row's text box
    }, 0);
  }

  focusOnNewRow(): void {
    const lastInput = this.nameInputs.last;
    if (lastInput) {
      lastInput.nativeElement.select(); // Focus and select the text in the input field
    }
  }

  removeRow(index: number) {
    if (this.vazhipadinfo.length > 1) {
      this.vazhipadinfo.removeAt(index);
      this.updateTotalAmount();
      this.updateSlno();
      this.notification.success('Data deleted successfully');
      this.setupAutocomplete(this.indexForAutoComplete);
      this.setupStarAutocomplete(this.indexForAutoComplete);
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
    console.log(date, 'aaaaaaaaaaaaaaaaa');
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
    if (value === null || value === undefined) {
      return [];
    }

    const filterValue = value.toLowerCase();
    const normalizedValue = value.normalize('NFC');

    // Check if the entered value is a number
    const isNumber = !isNaN(Number(value));

    let filteredList = this.VMList.filter((option) => {
      const vmName = option.VM_Name ? option.VM_Name.toLowerCase() : '';
      const vmCode = option.VM_Code ? option.VM_Code.toLowerCase() : '';
      const vmRName = option.VM_RName ? option.VM_RName.normalize('NFC') : '';

      return (
        vmName.includes(filterValue) ||
        vmCode.includes(filterValue) ||
        vmRName.includes(normalizedValue)
      );
    });

    // If the entered value is a number, sort the filtered list by VM_Code in ascending order
    if (isNumber) {
      filteredList = filteredList.sort((a, b) => {
        const aCode = Number(a.VM_Code); // Convert VM_Code to a number for comparison
        const bCode = Number(b.VM_Code);
        return aCode - bCode;
      });
    }

    return filteredList;
  }

  setupStarAutocomplete(index: number): void {
    const row = this.vazhipadinfo.at(index) as FormGroup;

    const control = row.get('starName');

    control?.valueChanges
      .pipe(
        startWith(''),
        map((value) => this._filterStar(value))
      )
      .subscribe((filteredOptions) => {
        this.starFilteredOption[index] = filteredOptions;
      });
  }

  private _filterStar(value: string | null | undefined): any[] {
    if (value === null || value === undefined) {
      return [];
    }

    const filterValue = value.toLowerCase();
    const normalizedValue = value.normalize('NFC');

    // Check if the entered value is a number
    const isNumber = !isNaN(Number(value));

    let filteredList = this.nakshatham.filter((option) => {
      const name = option.SM_Name ? option.SM_Name.toLowerCase() : '';
      const starCode = option.SM_Id
        ? option.SM_Id.toString().toLowerCase()
        : '';
      const starRName = option.SM_RName ? option.SM_RName.normalize('NFC') : '';

      return (
        name.includes(filterValue) ||
        starCode.includes(filterValue) ||
        starRName.includes(normalizedValue)
        // vmRName.includes(normalizedValue)
      );
    });

    // If the entered value is a number, sort the filtered list by VM_Code in ascending order
    if (isNumber) {
      filteredList = filteredList.sort((a, b) => {
        const aCode = Number(a.starCode); // Convert VM_Code to a number for comparison
        const bCode = Number(b.starCode);
        return aCode - bCode;
      });
    }

    return filteredList;
  }

  setupPrathistaAutocomplete(index: number): void {
    const row = this.vazhipadinfo.at(index) as FormGroup;

    const control = row.get('Prethista');

    control?.valueChanges
      .pipe(
        startWith(''),
        map((value) => this._filterPrathista(value, index))
      )
      .subscribe((filteredOptions) => {
        this.prathistaFilteredOption[index] = filteredOptions;
      });
  }

  private _filterPrathista(
    value: string | null | undefined,
    index: number
  ): any[] {
    if (value === null || value === undefined) {
      return [];
    }

    const filterValue = value.toLowerCase();
    const normalizedValue = value.normalize('NFC');

    // Check if the entered value is a number
    const isNumber = !isNaN(Number(value));

    let filteredList = this.prathishtaOptions[index].filter((option: any) => {
      const name = option.name ? option.name.toLowerCase() : '';
      const starCode = option.code ? option.code.toString().toLowerCase() : '';
      const starRName = option.rname ? option.rname.normalize('NFC') : '';

      return (
        name.includes(filterValue) ||
        starCode.includes(filterValue) ||
        starRName.includes(normalizedValue)
        // vmRName.includes(normalizedValue)
      );
    });

    // If the entered value is a number, sort the filtered list by VM_Code in ascending order
    if (isNumber) {
      filteredList = filteredList.sort((a: any, b: any) => {
        const aCode = Number(a.starCode); // Convert VM_Code to a number for comparison
        const bCode = Number(b.starCode);
        return aCode - bCode;
      });
    }

    return filteredList;
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
      // this.nakshatham = res;

      this.nakshatham = res.map((item) => ({
        SM_Id: item.id,
        SM_Name: item.SM_NameEng,
        SM_Code: item.SM_Code,
        SM_RName: item.SM_Name,
      }));
    });
  }

  vazhipadValidator(control: AbstractControl): ValidationErrors | null {
    const vazhipad = control.value;
    var vmExists;
    if (this.lang === 'en') {
      vmExists = this.VMList.some((vm) => vm.VM_Name === vazhipad);
      console.log(vmExists, 'uyuyuyuyy');
    } else if (this.lang != 'en') {
      vmExists = this.VMList.some((vm) => vm.VM_RName === vazhipad);
    }
    // const vmExists = this.VMList.some((vm) => vm.VM_RName === vazhipad);
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
    { id: '0', key: 'TIME1' },
    { id: '1', key: 'TIME2' },
    { id: '2', key: 'TIME3' },
    { id: '3', key: 'TIME4' },
  ];

  onSelect(event: MatAutocompleteSelectedEvent, index: number): void {
    const selectedVazhipad = event.option.value;

    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    selectedRow.get('Vazhipad')?.setValue(selectedVazhipad);

    // Fetch vazhipad details
    if (this.lang === 'en') {
      this.selectedVazhipadItem = this.VMList.find(
        (item) => item.VM_Name === selectedVazhipad
      );
    } else if (this.lang != 'en') {
      this.selectedVazhipadItem = this.VMList.find(
        (item) => item.VM_RName === selectedVazhipad
      );
    }

    console.log(this.selectedVazhipadItem);
    if (this.selectedVazhipadItem) {
      selectedRow.get('Vazhid')?.setValue(this.selectedVazhipadItem.VM_Id);

      // Fetch vazhipad details using VM_Code
      this.getSeasnalalVazhipadData(this.selectedVazhipadItem.VM_Id, index);
      this.getBlockingvazipadDate(this.selectedVazhipadItem.VM_Id, index);
      this.getDatamasterdateCheck(this.selectedVazhipadItem.VM_Id, index);
      const vazhipadCode = this.selectedVazhipadItem.VM_Code;

      this.fetchVazhipadDetails(vazhipadCode, index);
    } else {
      // Handle error or feedback if needed
    }
  }

  onStarSelect(event: MatAutocompleteSelectedEvent, index: number): void {
    const selectedStar = event.option.value;
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    selectedRow.get('Star')?.setValue(selectedStar);

    if (this.lang == 'en') {
      this.selectedStarData = this.nakshatham.find(
        (item) => item.SM_Name == selectedStar
      );
    } else if (this.lang != 'en') {
      this.selectedStarData = this.nakshatham.find(
        (item) => item.SM_RName === selectedStar
      );
    }

    if (this.selectedStarData) {
      selectedRow.get('Star')?.setValue(this.selectedStarData.SM_Id.toString());
    } else {
      console.error('Selected star item not found in VMList');
      // Handle error or feedback if needed
    }
  }

  onPrathistaSelect(event: MatAutocompleteSelectedEvent, index: number): void {
    const selectedStar = event.option.value;
    const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
    selectedRow.get('Star')?.setValue(selectedStar);

    if (this.lang == 'en') {
      this.selectedStarData = this.nakshatham.find(
        (item) => item.SM_Name == selectedStar
      );
    } else if (this.lang != 'en') {
      this.selectedStarData = this.nakshatham.find(
        (item) => item.SM_RName === selectedStar
      );
    }

    if (this.selectedStarData) {
      selectedRow.get('Star')?.setValue(this.selectedStarData.SM_Id.toString());
    } else {
      console.error('Selected star item not found in VMList');
      // Handle error or feedback if needed
    }
  }

  fetchVazhipadDetails(vazhipadcode: string, index: number): void {
    this.masterservice
      .getVazhipadeByCode(vazhipadcode)
      .subscribe((res: any) => {
        const selectedRow = this.vazhipadinfo.at(index) as FormGroup;

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
    } else if (booking === 'Y' && receipt === 'N') {
      selectedRow
        .get('VazhipadDate')
        ?.setValue(this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd'));
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(this.tomorrowDate, 'yyyy-MM-dd'));
    } else if (booking === 'N' && receipt === 'N') {
      selectedRow
        .get('VazhipadDate')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
    } else if (fromDate) {
      selectedRow.get('VazhipadDate')?.setValue(fromDate);
      selectedRow
        .get('dateToSet')
        ?.setValue(this.datePipe.transform(fromDate, 'yyyy-MM-dd'));
    }
  }

  focusSelect(): void {
    if (this.vTimeSelect) {
      this.vTimeSelect.nativeElement.focus();
    }
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
          rname: item.PM_RegName,
          code: item.PM_Code,
        }));
        const selectedRow = this.vazhipadinfo.at(index) as FormGroup;
        if (this.lang == 'en') {
          if (this.prathishtaOptions[index].length > 0) {
            const defaultPrathishta = this.prathishtaOptions[index][0].name;
            const defaultPrathishtaId = this.prathishtaOptions[index][0].id;

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
                const selectedPrathishtaObj = this.prathishtaOptions[
                  index
                ].find((option: any) => option.name === selectedPrathishta);
                if (selectedPrathishtaObj) {
                  selectedRow.get('PMid')?.setValue(selectedPrathishtaObj.id); // Set PMid based on selected Prathishta
                }
              });
          }
        } else if (this.lang != 'en') {
          if (this.prathishtaOptions[index].length > 0) {
            const defaultPrathishta = this.prathishtaOptions[index][0].rname;
            const defaultPrathishtaId = this.prathishtaOptions[index][0].id;

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
                const selectedPrathishtaObj = this.prathishtaOptions[
                  index
                ].find((option: any) => option.rname === selectedPrathishta);
                if (selectedPrathishtaObj) {
                  selectedRow.get('PMid')?.setValue(selectedPrathishtaObj.id); // Set PMid based on selected Prathishta
                }
              });
          }
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
      height: '80vh', // Adjust height as needed
      width: '85vw', // Fullscreen width
      maxWidth: '100vw', // Prevent dialog from being constrained
      panelClass: 'full-screen-dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.handleDialogData(result);
        const { finalArray, VM_MaxNo } = result;
        this.handleMultiDayBookingResult(finalArray, rowIndex, VM_MaxNo);
      }
    });
  }

  // to show multi day booked details
  openMultiDayBookedDetails(rowIndex: number) {
    const dialogRef = this.dialog.open(MultidaybookeddetailsComponent, {
      height: '80vh',
      maxWidth: '50vw',
      data: this.multidayBooking[rowIndex], // Pass the array values
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { finalArray, VM_MaxNo } = result;
        // this.handleMultiDayBookingResult(finalArray, rowIndex,VM_MaxNo);
      }
    });
  }

  formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const year = date.getFullYear(); // Get the full year
    return `${year}-${month}-${day}`; // Return formatted string in yyyy-mm-dd format}
  }

  private handleMultiDayBookingResult(
    result: any,
    rowIndex: number,
    singlevazhipadmultiday: number
  ): void {
    console.log(result, 'multiday filtering');
    const row = this.vazhipadinfo.at(rowIndex) as FormGroup;

    let lastIndex = result.length - 1;
    const data = result[0];

    //  data.VazhipadDate is a Date object
    const startDate = new Date(data.VazhipadDate); // This should be the start date
    const endDate = new Date(result[lastIndex].VazhipadDate); // This should be the end date
    const formattedDates = result.map((item: any) => {
      // Format the VazhipadDate property
      return {
        ...item,
        VazhipadDate: this.formatDateToDDMMYYYY(new Date(item.VazhipadDate)), // Format date here
      };
    });
    console.log(formattedDates, 'formatted dates to set fromdate and todate');
    this.multidayBooking[rowIndex] = formattedDates;
    row.patchValue({
      Vazhipad: data.Vazhipad,
      Vazhid: data.Vazhid,
      Prethista: data.Prethista,
      Qty: singlevazhipadmultiday > 0 ? 1 : data.Qty * result.length,
      Rate: data.Rate,
      VazhipadDate: this.datePipe.transform(startDate, 'yyyy-MM-dd') || '',
      TotalAmt: this.totalAmount,
      toDate: this.datePipe.transform(endDate, 'yyyy-MM-dd') || '',
      PMid: data.PMid,
      Mday: data.Mday,
      NalBy: data.NalBy,
      Mmonth: data.Mmonth,
      Name: data.Name,
      Star: data.Star,
      Name2: data.Name2,
      Star2: data.Star2,
      VTime: data.VTime,
      starName: this.getStarbyId(data.Star),
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

  focusInput(i: number): void {
    const inputElement = document.getElementById(
      `Name-${i}`
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
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

  private cleanVazhipadInfo(item: any) {
    //  const date1= this.formatDate(item.VazhipadDate)

    return {
      Amount: item.Amount, // Including Amount
      Mday: item.Mday, // Including Mday
      Mmonth: item.Mmonth, // Including Mmonth
      NalBy: item.NalBy, // Including NalBy
      Name: item.Name, // Including Name
      Name2: item.Name2, // Including Name2 (if applicable)
      PMid: item.PMid, // Including PMid
      Postal: item.Postal, // Including Postal
      Prethista: item.Prethista, // Including Prethista
      Qty: item.Qty, // Including Qty
      Rate: item.Rate, // Including Rate
      Slno: item.Slno, // Including Slno
      Star: item.Star, // Including Star
      Star2: item.Star2, // Including Star2 (if applicable)
      TotalAmt: item.TotalAmt, // Including TotalAmt
      Vazhid: item.Vazhid, // Including Vazhid
      Vazhipad: item.Vazhipad, // Including Vazhipad
      VazhipadDate: item.VazhipadDate, // Including VazhipadDate
      VTime: item.VTime,
      FromDate: item.VazhipadDate,
      ToDate: item.VazhipadDate,
      SearchBy: item.SearchBy,
    };
  }

  formatDate(dateString: any): string {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getFullYear()}`;
  }

  // api data send
  sendDataToApi(data: any) {
    let isFormValid = true; // Initialize form validity
    let multidayRowIndices: number[] = [];
    // Iterate through each form group (row) in the vazhipadinfo FormArray
    this.vazhipadinfo.controls.forEach((row, index) => {
      row.markAllAsTouched();
      // Check if the current row is invalid
      if (row.invalid) {
        isFormValid = false;
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
        return;
      } else {
        if (this.multidayBooking[index]) {
          multidayRowIndices.push(index); // Store the index if multidayBooking data exists
        }
      }
    });

    // If the form is invalid, do not proceed with the API call
    if (!isFormValid) {
      return;
    }

    const flattenedData = this.flattenMultiDayBooking();
    console.log(flattenedData, 'to know wat it is');
    const vazhipadinfo = data.vazhipadinfo || []; // Ensure vazhipadinfo is an array
    // code for remove multiday showing row.
    for (let i = multidayRowIndices.length - 1; i >= 0; i--) {
      const indexToRemove = multidayRowIndices[i];
      vazhipadinfo.splice(indexToRemove, 1);
    }
    const cleanedVazhipadinfo = vazhipadinfo.map(this.cleanVazhipadInfo);
    console.log(cleanedVazhipadinfo, 'cleaned vazhipad info');
    const combinedVazhipadinfo = [...cleanedVazhipadinfo, ...flattenedData];

    this.printData = vazhipadinfo;
    const updatedData = {
      ...data,
      vazhipadinfo: combinedVazhipadinfo,
    };

    // const updatedData = {
    //   ...data,
    //   vazhipadinfo: data.vazhipadinfo.map((item:any) => ({
    //     ...item,
    //     TotalAmt: this.t, // Calculate the new TotalAmt
    //   })),
    // };

    console.log(updatedData, 'checking all data add total amount');
    const formattedData = this.formatDateFields(updatedData);
    console.log(formattedData, 'Bill Data aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    if (formattedData.Trnsmode !== 'CS') {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: { message: `Do you want to proceed with digital payment ?` },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const transactionPayLoad = {
            TransactionNumber: '1598/0229',
            SequenceNumber: 1,
            AllowedPaymentMode: '1',
            MerchantStorePosCode: '1225053011',
            Amount: '100',
            UserID: 'Rinsha',
            MerchantID: 181763,
            SecurityToken: '72aaee9c-37b0-4f52-bb9b-b411b0dd2d70',
            IMEI: 'PINE2607971',
            AutoCancelDurationInMinutes: 5,
          };
          this.masterservice
            .upLoadTransaction(transactionPayLoad)
            .subscribe((data) => {
              console.log(data);
            });
          this.prnitConfirmDialog(formattedData);
        } else {
          // this.resetForm();
          // User did not confirm, save the data to the database
        }
      });
    } else {
      this.prnitConfirmDialog(formattedData);
    }
  }

  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }

  // confirm printing
  prnitConfirmDialog(formattedData: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Do you want to proceed with printing ?' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.receiptPrintService.setReceiptData(formattedData);   this is originallllllll print calll
        this.sendBillingDataApiCall(formattedData);
        this.cancelFlag = false;
      } else {
        this.sendBillingDataApiCall(formattedData);

        this.cancelFlag = true;
        // User did not confirm, save the data to the database
      }
    });
  }

  // api call send billinf data to db
  sendBillingDataApiCall(formattedData: any) {
    const updatedData = {
      ...formattedData,
      vazhipadinfo: formattedData.vazhipadinfo.map((item: any) => ({
        ...item,
        TotalAmt: this.totalAmount.toString(), // Calculate TotalAmt dynamically
      })),
    };

    console.log(
      updatedData,
      'sendBillingDataApiCall at last callllllllllllllllllllllllll'
    );

    this.masterservice.getLastBillNumber().subscribe((data) => {
      console.log(data, 'ffrfrere');

      if (data[0].billno) {
        this.lockTableLastbillNumber = data[0].billno;
        console.log(this.lockTableLastbillNumber);
        console.log(this.billNumberFormatDate);
        this.generatedCurrentBillnumber =
          this.lockTableLastbillNumber.toString() +
          '/' +
          this.billNumberFormatDate;
        console.log(this.generatedCurrentBillnumber);
        updatedData.BillNo = this.generatedCurrentBillnumber;
        console.log(updatedData, 'after add bill number');

        const payLoad = {
          Type: 'BookingBillLock',
          Code: this.CounterId + 'Lock',
        };
        console.log(payLoad);
        this.masterservice.getMaster(payLoad).subscribe((data) => {
          console.log(data, 'locked billapi reposnse');
          this.onSubmitBookingDetailsApiCall(updatedData);
        });
      } else {
        this.retryFetchBillNumber(updatedData);
      }
    });
  }

  retryFetchBillNumber(updatedData: any, retryCount = 0) {
    if (retryCount >= 3) {
      this.notification.error(
        'Unable to fetch a unique bill number. Please contact support.'
      );
      return;
    }

    setTimeout(() => {
      this.sendBillingDataApiCall(updatedData);
    }, 2000); // Retry after 2 seconds
  }

  onSubmitBookingDetailsApiCall(formattedData: any) {
    console.log(formattedData, 'data send to api before the submission');
    this.masterservice.vazhipadBooking(formattedData).subscribe((res: any) => {
      if (res) {
        if (res.RespStatus === 'I') {
          this.masterservice
            .updateLastBillNumber(this.lockTableLastbillNumber + 1)
            .subscribe({
              next: (data) => {
                this.eventService.notifytheupdateLastbillnumber();
              },
              error: (err) => {},
            });
          if (!this.cancelFlag) {
            this.receiptPrintService.setReceiptData(formattedData);
          }
          this.receiptPrintService.setBooleanValue(true);
          this.notification.success(res.RespMsg);
          this.resetForm();
          // this.masterservice.getLastBillNumber().subscribe({
          //   next: (lastbillno) => {
          // const lastBillNumber = lastbillno[0].billno;
          // const currentBillnumber = lastBillNumber + 1;
          // console.log(currentBillnumber)
          // this.masterservice
          //   .updateLastBillNumber(this.lockTableLastbillNumber+1)
          //   .subscribe({
          //     next: (data) => {
          //       this.eventService.notifytheupdateLastbillnumber();
          //     },
          //     error: (err) => {},
          //   });

          this.isDataSaved = true;
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
    this.multidayBooking = [];
    this.cancelFlag = false;
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
            FromDate: item.FromDate,
            ToDate: item.ToDate,
            SearchBy: String(item.SearchBy),
          };
        }
      );
    }
    return formattedData;
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
          }
        });
      }
    });
  }

  // getseasonal vazhipad data
  getSeasnalalVazhipadData(vid: string, index: number) {
    this.masterservice.getSeasonalVazhipadDateCheck(vid).subscribe({
      next: (data) => {
        // Check if the response data is empty or not
        if (data && data.length > 0) {
          const seasonalDates = {
            fromDate: data[0].VS_FromDate,
            toDate: data[0].VS_ToDate,
          };

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
        } else {
          const row = this.vazhipadinfo.at(index) as FormGroup;
          row.get('seasonalDates')?.patchValue({ fromDate: '', toDate: '' });
          row.get('vazhipadDate')?.patchValue('');
          // Optionally, show a notification or alert to inform the user
        }
      },
      error: (err) => {
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
  // Define a day mapping object
  private dayMapping: { [key: number]: string } = {
    1: 'Sunday',
    2: 'Monday',
    3: 'Tuesday',
    4: 'Wednesday',
    5: 'Thursday',
    6: 'Friday',
    7: 'Saturday',
  };

  // Get the day master vazhipad data
  getDatamasterdateCheck(vid: string, index: number) {
    const row = this.vazhipadinfo.at(index) as FormGroup;
    this.masterservice.getDayMastervazhipaddateCheck(vid).subscribe({
      next: (data) => {
        console.log(data, 'day master');

        // Extract 'Day' field values
        const allowedDays = data.map((item: any) => item.Day);

        // Convert day IDs to day names
        const allowedDayNames = allowedDays.map(
          (dayId) => this.dayMapping[dayId] || 'Unknown'
        );

        // Get the 'allowedDays' FormArray from the current row
        const allowDaysFormArray = row.get('allowedDays') as FormArray;

        // Clear previous allowed days in the FormArray
        while (allowDaysFormArray.length) {
          allowDaysFormArray.removeAt(0);
        }

        // Push the extracted 'Day' values into the 'allowedDays' FormArray
        // Push the **day names** into the FormArray
        allowedDayNames.forEach((dayName: string) => {
          allowDaysFormArray.push(this.fb.control(dayName));
        });

        console.log('Allowed Days (IDs):', allowedDays);
        console.log('Allowed Days (Names):', allowedDayNames);
        console.log(row);
      },
      error: (err) => {
        console.error('Error fetching day master data:', err);
      },
    });
  }
  // checkDayBasedVazhipadDate(row: FormGroup): void {
  //   const allowedDays = row.get('allowedDays')?.value as number[];
  //   const vazhipadDate = row.get('VazhipadDate')?.value;
  //   if (allowedDays && vazhipadDate) {
  //     const dateToCheck = new Date(vazhipadDate);
  //     const dayOfWeek = dateToCheck.getDay(); // Sunday: 0, Monday: 1, etc
  //     if (!allowedDays.includes(dayOfWeek + 1)) {
  //       // Adjusting dayOfWeek to match your numbering
  //       this.notification.error(
  //         'Selected VazhipadDate is not on an allowed day.'
  //       );
  //       row.get('VazhipadDate')?.setValue(''); // Optionally reset the date
  //     }
  //   }
  // }

  clearAll() {
    this.resetForm();
  }

  handleTabKeyDown(event: KeyboardEvent, index: number): void {
    // Check if the Tab key is pressed
    if (event.key === 'enter') {
      // Prevent the default behavior so it doesn't move focus immediately
      event.preventDefault();

      // Call the addRow function to add a new row
      this.addRow(index);
    }
  }

  ngAfterViewInit(): void {
    // Focus on the first input field when the page loads
    this.firstInputElement.nativeElement.focus();
  }

  getStarbyId(id: string) {
    console.log(id, 'star id');
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.SM_Id == id);
      return star ? star.SM_Name : '';
    } else if (this.lang != 'en') {
      const star = this.nakshatham.find((item) => item.SM_Id == id);
      return star ? star.SM_RName : '';
    }

    // console.log(star,"sssssssssssssssss")
  }

  changeLanguage(lang: any) {
    const selectedlang = lang.target.value;
    localStorage.setItem('Language', selectedlang);
    this.ts.use(selectedlang);
  }

  handleKeyDowns(event: KeyboardEvent, index: number): void {
    if (event.key === 'ArrowLeft') {
      // Prevent default behavior of the left arrow key
      event.preventDefault();

      // Get the previous input element in the row
      const inputs = document.querySelectorAll(
        'form [formControlName]'
      ) as NodeListOf<HTMLInputElement>;

      // Focus the previous input element (if any)
      if (inputs[index - 1]) {
        (inputs[index - 1] as HTMLInputElement).focus();
      }
    }
  }

  // onKeydown(event: KeyboardEvent, index: number) {
  //   const inputElements = this.inputRefs.toArray();  // Convert the QueryList to an array of ElementRef

  //   if (event.key === 'ArrowLeft') {
  //     // Find the current element's index in the inputRefs list
  //     const currentIndex = inputElements.findIndex(input => input.nativeElement === event.target);

  //     // Move to the previous element if it's not the first one
  //     if (currentIndex > 0) {
  //       inputElements[currentIndex - 1].nativeElement.focus();
  //       event.preventDefault(); // Prevent default behavior of the left arrow key
  //     }
  //   }
  // }

  // Time threshold in milliseconds to consider as double press

  navigateToNext(event: Event, rowIndex: number, nextField: string): void {
    const keyboardEvent = event as KeyboardEvent;
    console.log(keyboardEvent.key, 'keyyyy');
    // Get the current time
    const currentTime = new Date().getTime();

    if (keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault();

      // Check if the time between two Enter key presses is within the threshold for double press
      if (currentTime - this.lastEnterTime < this.doubleEnterThreshold) {
        // If double Enter is detected, add a new row
        this.addRow(rowIndex);
      }

      // Update the last Enter press time
      this.lastEnterTime = currentTime;

      // Reset the lastEnterTime after the double press threshold (optional)
      setTimeout(() => {
        this.lastEnterTime = 0; // Reset to allow another detection of double Enter later
      }, this.doubleEnterThreshold);

      // Get all form elements within the row
      const rowFormElements = Array.from(
        document.querySelectorAll(
          `#row-${rowIndex} input, #row-${rowIndex} mat-select, #row-${rowIndex} select, #row-${rowIndex} textarea`
        )
      ) as HTMLElement[];

      // Remove the highlighted class from all elements first
      rowFormElements.forEach((el) => el.classList.remove('highlighted'));
      // Find the index of the currently active (focused) element
      let currentIndex = rowFormElements.findIndex(
        (el) => el === document.activeElement
      );

      if (currentIndex === -1) {
        console.error('Current active element not found in form elements.');
        return;
      }

      // Get the current element
      const currentElement = rowFormElements[currentIndex];
      // Check if the current element has a value (if it's empty, show red border)
      if (
        currentElement instanceof HTMLInputElement ||
        currentElement instanceof HTMLTextAreaElement ||
        currentElement instanceof HTMLSelectElement
      ) {
        if (!currentElement.value.trim()) {
          // Add red border if field is empty
          currentElement.classList.add('invalid');
          return; // Don't proceed with navigation until the field has data
        } else {
          // Remove red border if field has data
          currentElement.classList.remove('invalid');
        }
      }

      // If nextField is specified (for example, 'VazhipadDate'), find the corresponding element
      const nextElement = rowFormElements.find(
        (el) => el.getAttribute('formControlName') === nextField
      );

      if (nextElement) {
        // Focus the next element
        nextElement.focus();
        nextElement.classList.add('highlighted');
        // For mat-select, open the dropdown if it's a mat-select
        if (nextElement.tagName.toLowerCase() === 'mat-select') {
          const matSelect = nextElement as any;
          if (matSelect && matSelect.open) {
            matSelect.open(); // Open mat-select dropdown
          }
        } else if (nextElement.tagName.toLowerCase() === 'select') {
          // Open <select> dropdown (trigger click)
          const selectElement = nextElement as HTMLSelectElement;
          const clickEvent = new MouseEvent('click', { bubbles: true });
          selectElement.dispatchEvent(clickEvent); // Trigger click to open dropdown
        }
      } else {
        // If no specific next field, just navigate to the next available element
        let nextElement = rowFormElements[currentIndex + 1];

        // Skip over any hidden elements or elements that are not focusable (if needed)
        while (
          nextElement &&
          (nextElement.hasAttribute('hidden') ||
            nextElement.getAttribute('disabled') !== null)
        ) {
          nextElement = rowFormElements[++currentIndex + 1];
        }

        // If there's a next element, focus it
        if (nextElement) {
          nextElement.focus();

          // For mat-select, open the dropdown if it's a mat-select
          if (nextElement.tagName.toLowerCase() === 'mat-select') {
            const matSelect = nextElement as any;
            if (matSelect && matSelect.open) {
              matSelect.open(); // Open mat-select dropdown
            }
          } else if (nextElement.tagName.toLowerCase() === 'select') {
            // Open <select> dropdown (trigger click)
            const selectElement = nextElement as HTMLSelectElement;
            const clickEvent = new MouseEvent('click', { bubbles: true });
            selectElement.dispatchEvent(clickEvent); // Trigger click to open dropdown
          }
        } else {
          console.warn('Next element not found. End of row reached.');
        }
      }
    }

    // Handle ArrowLeft (Left Arrow Key)
    if (keyboardEvent.key === 'ArrowLeft') {
      console.log('left arrow pressed');
      keyboardEvent.preventDefault(); // Prevent default behavior (such as moving cursor within text field)

      // Get all form elements within the row
      const rowFormElements = Array.from(
        document.querySelectorAll(
          `#row-${rowIndex} input, #row-${rowIndex} mat-select, #row-${rowIndex} select, #row-${rowIndex} textarea`
        )
      ) as HTMLElement[];

      // Find the index of the currently active (focused) element
      let currentIndex = rowFormElements.findIndex(
        (el) => el === document.activeElement
      );

      if (currentIndex === -1) {
        console.error('Current active element not found in form elements.');
        return;
      }

      // Focus the previous element (move right to left)
      let prevElement = rowFormElements[currentIndex - 1];

      // Skip over any hidden or disabled elements (if needed)
      while (
        prevElement &&
        (prevElement.hasAttribute('hidden') ||
          prevElement.getAttribute('disabled') !== null)
      ) {
        prevElement = rowFormElements[--currentIndex - 1];
      }

      // If there's a previous element, focus it
      if (prevElement) {
        prevElement.focus();

        // For mat-select, open the dropdown if it's a mat-select
        if (prevElement.tagName.toLowerCase() === 'mat-select') {
          const matSelect = prevElement as any;
          if (matSelect && matSelect.open) {
            matSelect.open(); // Open mat-select dropdown
          }
        } else if (prevElement.tagName.toLowerCase() === 'select') {
          const selectElement = prevElement as HTMLSelectElement;
          const clickEvent = new MouseEvent('click', { bubbles: true });
          selectElement.dispatchEvent(clickEvent); // Trigger click to open dropdown
        }
      } else {
        console.warn('Previous element not found. Beginning of row reached.');
      }
    }

    // Handle ArrowDown (Down Arrow Key)
    if (keyboardEvent.key === 'ArrowDown') {
      console.log('down arrow pressed');
      keyboardEvent.preventDefault(); // Prevent default behavior

      // Move to the next row
      const nextRow = document.querySelector(`#row-${rowIndex + 1}`);
      if (nextRow) {
        // Focus the first element in the next row
        const firstElementInNextRow = nextRow.querySelector(
          'input, mat-select, select, textarea'
        );
        if (firstElementInNextRow) {
          (firstElementInNextRow as HTMLElement).focus();
        }
      }
    }

    // Handle ArrowUp (Up Arrow Key)
    if (keyboardEvent.key === 'ArrowUp') {
      console.log('up arrow pressed');
      keyboardEvent.preventDefault(); // Prevent default behavior

      // Move to the previous row
      const prevRow = document.querySelector(`#row-${rowIndex - 1}`);
      if (prevRow) {
        // Focus the first element in the previous row
        const firstElementInPrevRow = prevRow.querySelector(
          'input, mat-select, select, textarea'
        );
        if (firstElementInPrevRow) {
          (firstElementInPrevRow as HTMLElement).focus();
        }
      }
    }
  }

  getBlockingvazipadDate(vmId: any, index: any) {
    const payLoad = { Type: 'BlockingALL', Code: vmId };
    this.masterservice.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data, 'datablocing');

        const row = this.vazhipadinfo.at(index) as FormGroup;

        if (data && data.length > 0) {
          const blockingDatesArray = data.map((d: any) =>
            this.datePipe.transform(d.VBDate, 'yyyy-MM-dd')
          );
          console.log(blockingDatesArray, 'blockingDatesArray');

          // Get the FormArray and reset it
          const blockingDatesControl = row.get(
            'blockingDates.dates'
          ) as FormArray;
          blockingDatesControl.clear();

          // Populate the FormArray with blocking dates
          blockingDatesArray.forEach((date: any) => {
            blockingDatesControl.push(new FormControl(date));
          });
          console.log(row, 'roqqqqqqqqqqqqqqqqq');
          // this.setVazhipadDate(index);
          this.setVazhipadDate(index);
        } else {
          row.get('blockingDates')?.patchValue({ dates: [] });
          row.get('vazhipadDate')?.patchValue('');
          // Optionally, show a notification or alert to inform the user
        }
      },
      error: (err) => {
        // Handle error case by resetting seasonal dates
        const row = this.vazhipadinfo.at(index) as FormGroup;
        row.get('blockingDates')?.patchValue({ dates: [] });
        row.get('vazhipadDate')?.patchValue('');
        // Optionally, show a notification or alert to inform the user
        this.notification.error(
          'Error fetching blocking data. Please try again later.'
        );
      },
    });
  }

  openBillingDialog(mobileNumber: any) {
    const dialogRef = this.dialog.open(BillingViaMobilenumberComponent, {
      width: '600px',
      data: mobileNumber, // Pass any data to the dialog if needed
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Selected Rows:', result);
      this.nameStarArray = result.selectedData;
      this.singleorMultiDay = result.SmFlag;
      console.log(this.singleorMultiDay);
      if (result) {
        let index = this.vazhipadinfo.length - 1;
        console.log(index, 'firsrt index check');

        if (this.singleorMultiDay) {
          if (index == 0) {
            this.openDevoteeMasterMultiDayDialog(index, this.nameStarArray);
          } else {
            this.openDevoteeMasterMultiDayDialog(index + 1, this.nameStarArray);
          }
        } else {
          // Add multiple rows based on the array of Name and Star pairs
          this.nameStarArray.forEach((item: { Name: string; Star: string }) => {
            this.addRowsFromNameStarArray(item.Name, item.Star, index);
            index++;
          });
        }
      }
    });
  }

  // Method to dynamically add a row to the form
  addRowsFromNameStarArray(name: string, star: string, index: number): void {
    // const index=this.vazhipadinfo.length-1;
    //   if(index==0){
    //   const row = this.vazhipadinfo.at(index) as FormGroup;
    //   row.patchValue({
    //    Name:name,
    //     starName:star,
    //     Star:"1"
    //   })
    //  }
    this.addRowForNameAndStar(index, name, star);
  }

  addRowForNameAndStar(index: number, name: string, star: string): void {
    // if (index === -1 && this.vazhipadinfo.length === 0) {
    //   this.vazhipadinfo.push(this.createRow());
    //   this.setupAutocomplete(0);
    //   this.setupStarAutocomplete(0);
    //   this.updateTotalAmount();
    //   return;

    // }
    // this.indexForAutoComplete = index;
    // if (
    //   this.vazhipadinfo.length > 0 &&
    //   !this.vazhipadinfo.at(this.vazhipadinfo.length - 1).valid
    // ) {
    //   const row = this.vazhipadinfo.at(index) as FormGroup;

    // }

    // const currentRow = this.vazhipadinfo.at(index) as FormGroup;
    // const currentName = currentRow.get('Name')?.value;
    // const currentStar = currentRow.get('Star')?.value;
    if (index == 0) {
      const row = this.vazhipadinfo.at(index) as FormGroup;
      row.patchValue({
        Name: name,
        starName: star,
        Star: this.getStarbyIName(star),
      });
    } else {
      const newRow = this.createRow();
      newRow.patchValue({
        Name: name,
        Star: this.getStarbyIName(star),
        starName: star,
      });

      this.vazhipadinfo.insert(index, newRow);
      this.setupAutocomplete(index);
      this.setupStarAutocomplete(index);
      this.updateTotalAmount();
      setTimeout(() => {
        this.focusOnNewRow(); // Focus on the newly created row's text box
      }, 0);
    }
  }

  getStarbyIName(Name: string) {
    console.log(Name, 'star id');
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.SM_Name == Name);
      return star ? star.SM_Id : '';
    } else if (this.lang != 'en') {
      const star = this.nakshatham.find((item) => item.SM_RName == Name);
      return star ? star.SM_RName : '';
    }
  }

  // opne multiday open dialog box
  openDevoteeMasterMultiDayDialog(rowIndex: number, data: any): void {
    console.log(rowIndex, 'multiday index check');
    console.log(data, 'multiday ');
    const dialogRef = this.dialog.open(MultidayitemsComponent, {
      height: '80vh', // Adjust height as needed
      width: '85vw', // Fullscreen width
      maxWidth: '100vw', // Prevent dialog from being constrained
      panelClass: 'full-screen-dialog',
      disableClose: true,
      data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.handleDialogData(result);
        const { finalArray, VM_MaxNo } = result;
        this.handleMultiDayBookingResult(finalArray, rowIndex, VM_MaxNo);
      }
    });
  }
}

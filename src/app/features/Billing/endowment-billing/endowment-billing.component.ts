import { Component, inject, Inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NumberDirective } from '../../../shared/directives/number/number.directive';

import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { lastValueFrom, map, Observable, of, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../../services/master/master.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { multiDayFilter } from '../../../models/multidayFilter.model';
import { TranslateService } from '@ngx-translate/core';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import { BillingViaMobilenumberComponent } from '../billing-via-mobilenumber/billing-via-mobilenumber.component';

@Component({
  selector: 'app-endowment-billing',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    MatAutocompleteModule,
    AsyncPipe,
    UpperCaseDirective,
    FormsModule,
    MatInputModule,
    NumberDirective,
    TranslateModule,
  ],
  templateUrl: './endowment-billing.component.html',
  styleUrl: './endowment-billing.component.css',
  providers: [DatePipe],
})
export class EndowmentBillingComponent {
  form: FormGroup;
  filteredOptions: Observable<any[]>;
  starData: Observable<any[]>;
  VMList: any[] = [];
  nakshatham: any[];
  mobileNumber: string = '';
  thithiList: any[] = [];
  prathishtaOptions: any[] = [];
  totalAmount: number = 0;
  tomorrowDate: Date;
  minDate: any;
  amountPerDevotee: number = 0;
  lang: string | null;
  daysList: any[] = [];
  selectedVazhipadItem: any;
  updatedDayList: any[] = [];
  devotees: FormArray;
  rateChange: string = 'N';
  seasonalDates: { fromDate: any; toDate: any } | null = null;
  allowedDays: any[] = [];
  currentDate = new Date();
  filteredStars: Observable<string[]>[] = [];
  starList: string[] = [];
  formattedDates:any[];
  blockingArray:any[];
  VM_MaxNo:number;
  nameStarArray: any[];
  MlayalamDays = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32',
  ];
  EnglishDays = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', ' 17', '18', '19', '20', '21', '22', '23', ' 24', '25', '26', '27', ' 28', ' 29', '30', '31',
  ];
  malayalamMonthList: any[];
  multidayFilterForm: FormGroup;
  multiDayList: multiDayFilter[] = [];
  updatedmultiDayList: multiDayFilter[] = [];
  memberDevoteeCheck:boolean=false;
  private readonly masterservice = inject(MasterService);
  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private notification: NotificationService,
    // public dialogRef: MatDialogRef<EndowmentBillingComponent>,
    private datePipe: DatePipe,
    private ts: TranslateService,
    // @Inject(MAT_DIALOG_DATA) public data: { Name: string,Star:string ,MID:string}[],

  ) {
    // console.log(data,"multiday devoteee master checking")
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.tomorrowDate = new Date();
    this.tomorrowDate.setDate(this.tomorrowDate.getDate() + 1); // Add 1 day to get tomorrow
    const formattedDate = this.datePipe.transform(
      this.tomorrowDate,
      'yyyy-MM-dd'
    ); // Format the date
    this.minDate = formattedDate;
    this.form = this.fb.group({
      Vazhipad: ['', [Validators.required, this.vazhipadValidator.bind(this)]],
      Rate: ['1', Validators.required],
      Qty: ['1', Validators.required],
      NoOfDays: ['1', Validators.required],
      EndDate: ['', Validators.required],
      Prethista: [''],
      PMid: [''],
      multiName: [''],
      // devotees: this.fb.array([]),
      Slno: [''],
      Vazhid: [''],
      Amount: [''],
      VazhipadDate: [formattedDate, [Validators.required]],
      VTime: ['0', [Validators.required]],
      Postal: ['10'],
      Mday: [''],
      NalBy: [''],
      Mmonth: [''],
      FromDate: [''],
      SearchBy: [''],
      multiname: [{ disabled: true, value: '' }],
      booking: [{ disabled: true, value: '' }],
      ratechange: [{ disabled: true, value: '' }],
      VM_Receipt: [{ disabled: true, value: '' }],
      // VM_MaxNo:[],
      devotees: this.fb.array([this.createDevotee()]),
    });
    this.devotees = this.form.get('devotees') as FormArray;
    this.multidayFilterForm = this.fb.group({
      Star: [''],
      EngMonth: [''],
      MalMonth: [''],
      EngishDay: [''],
      MalDay: [''],
      Thithi: [''],
    });
    this.getmultidayfilterData();
  }

  createDevotee(): FormGroup {
    return this.fb.group({
      Name: ['', [Validators.required]],
      Star: ['', [Validators.required]],
      Name2: [''],
      Star2: [''],
    });
  }

  addDevotee() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.validateDevoteeName();
      this.showValidationErrors();
      return; // Exit early if the main form is invalid
    }

    const lastDevotee = this.devotees.at(this.devotees.length - 1) as FormGroup;
    if (lastDevotee.invalid) {
      this.showDevoteeValidationErrors(lastDevotee);
      return; // Exit early if the last devotee form is invalid
    }
    this.devotees.push(this.createDevotee());
  }

  private showValidationErrors() {
    if (this.form.get('VazhipadDate')?.invalid) {
      this.notification.showError('Enter a valid date', 'Validation Error');
    }
    if (this.form.get('Rate')?.invalid) {
      this.notification.showError('Enter a valid Rate', 'Validation Error');
    }

    if (this.form.get('Vazhipad')?.invalid) {
      this.notification.showError(
        'Please enter the Vazhipad',
        'Validation Error'
      );
    }
    if (this.form.get('NoOfDays')?.invalid) {
      const errors = this.form.get('NoOfDays')?.errors;
      if (errors?.['required']) {
        this.notification.showError(
          'Number of Days is required',
          'Validation Error'
        );
      }
      if (errors?.['min']) {
        this.notification.showError(
          'Number of Days must be at least 1',
          'Validation Error'
        );
      }
    }
  }

  private showDevoteeValidationErrors(devotee: FormGroup): void {
    const controls = devotee.controls;
    for (const key in controls) {
      if (
        controls[key].invalid &&
        (controls[key].touched || controls[key].dirty)
      ) {
        this.notification.showError(
          `Validation error in ${key}: `,
          'Validation Error'
        );
      }
    }
  }

  // star data auto compleate

  setUpstarAutocomplete() {
    const devoteesArray = this.form.get('devotees') as FormArray;
    devoteesArray.controls.forEach((control, index) => {
      this.filteredStars[index] = control.get('Star')!.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterStar(value || ''))
      );
    });
  }

  private _filterStar(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.nakshatham.filter((star) =>
      star.SM_NameEng.toLowerCase().includes(filterValue)
    );
  }

  removeDevotee(index: number) {
    if (this.devotees.length === 1) {
      this.notification.showError(
        'At least one devotee is required.',
        'Validation Error'
      );
      return;
    }
    this.devotees.removeAt(index);
  }

  ngOnInit() {
    this.setDefaultVazhipadDate();
    this.getAllvazhipad();
    this.setupAutocomplete();
    this.getNakshthram();
    this.getThithiList();
    this.getmultidayfilterData();
    this.getMalayalamMonthList();
    this.onDropdownChange();
    this.form.get('VazhipadDate')?.valueChanges.subscribe((value) => {
      this.getmultidayfilterData();
    });
    this.form.get('NoOfDays')?.valueChanges.subscribe((value) => {
      this.getmultidayfilterData();
    });

   

  }


  populateDevotees(data: { Name: string; Star: string; MID: string }[]) {
    this.devotees.clear(); // Clear previous entries if any
  
    data.forEach(devotee => {
      this.devotees.push(this.fb.group({
        Name: [devotee.Name || '', [Validators.required]],
        Star: [this.getStarIdByName(devotee.Star) || '', [Validators.required]],
        Name2: [''], // Optional fields
        Star2: [''],
      }));
    });
  
    // If MID needs to be stored separately, assuming all have same MID:
    // if (data.length > 0) {
    //   this.form.patchValue({ PMid: data[0].MID });
    // }
  }

  async getStarIdByName(starName: string): Promise<any> {
    console.log(starName, "star nameeeee");
  
    const payLoad = { Type: 'ListStar', Code: '' };
  
    try {
      this.nakshatham = await lastValueFrom(this.masterservice.getStarData(payLoad));
      console.log(this.nakshatham, "Nakshathram data loaded");
  
      if (!this.nakshatham || !Array.isArray(this.nakshatham)) {
        console.error("Nakshatham data is undefined or not an array");
        return null;
      }
  
      const foundStar = this.nakshatham.find(star => star.SM_NameEng === starName);
      console.log(foundStar, "data checking star");
  console.log(foundStar.id,"ccccccccccccccccccc");
      return foundStar ? foundStar.Id : null;
    } catch (error) {
      console.error("Error fetching Nakshathram data:", error);
      return null;
    }
  }
  getThithiList() {
    const payLoad = { Type: 'Thithi', code: '' };
    this.masterservice.getThithilist(payLoad).subscribe((res: any) => {
      this.thithiList = res;
      console.log(this.thithiList);
    });
  }

  onDropdownChange() {
    this.multidayFilterForm
      .get('EngishDay')
      ?.valueChanges.subscribe((value) => {
        if (value !== '') {
          this.multidayFilterForm.patchValue({
            MalDay: '',
            Thithi: '',
            MalMonth: '',
          });
        }
      });
    this.multidayFilterForm.get('MalDay')?.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.multidayFilterForm.patchValue({ EngishDay: '', Thithi: '' });
      }
    });
    this.multidayFilterForm.get('Star')?.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.multidayFilterForm.patchValue({ Thithi: '' });
      }
    });
    this.multidayFilterForm.get('EngMonth')?.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.multidayFilterForm.patchValue({ Thithi: '' });
      }
    });
    this.multidayFilterForm.get('MalMonth')?.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.multidayFilterForm.patchValue({ Thithi: '', EngishDay: '' });
      }
    });

    this.multidayFilterForm.get('Thithi')?.valueChanges.subscribe((value) => {
      if (value !== '') {
        this.multidayFilterForm.patchValue({
          Star: '',
          EngMonth: '',
          MalMonth: '',
          EngishDay: '',
          MalDay: '',
        });
      }
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

  setDefaultVazhipadDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Add 1 day to get tomorrow
    const formattedDate = this.datePipe.transform(tomorrow, 'yyyy-MM-dd'); // Format the date
    this.form.get('VazhipadDate')?.setValue(formattedDate); // Set the default value
  }

  getNakshthram() {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterservice.getStarData(payLoad).subscribe((res) => {
      this.nakshatham = res;
      console.log(this.nakshatham);
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
  }

  setupAutocomplete() {
    this.filteredOptions = this.form.get('Vazhipad')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

 

  // onSelectStar(index: number, event: MatAutocompleteSelectedEvent): void {
  //   const selectedStar = event.option.value;
  //   const devoteesArray = this.form.get('devotees') as FormArray;
  //   devoteesArray.at(index).get('Star')?.setValue(selectedStar);
  // }

  onSelect(event: MatAutocompleteSelectedEvent): void {
    const selectedVazhipad = event.option.value;
    this.form.get('Vazhipad')?.setValue(selectedVazhipad);

    if (this.lang == 'en') {
      this.selectedVazhipadItem = this.VMList.find(
        (item) => item.VM_Name === selectedVazhipad
      );
    } else if (this.lang == 'ml') {
      this.selectedVazhipadItem = this.VMList.find(
        (item) => item.VM_RName === selectedVazhipad
      );
    }

    console.log(this.selectedVazhipadItem);
    if (this.selectedVazhipadItem) {
      console.log(this.selectedVazhipadItem);
      this.form.get('Vazhid')?.setValue(this.selectedVazhipadItem.VM_Id);
      const vazhipadCode = this.selectedVazhipadItem.VM_Code;
      console.log(vazhipadCode);
      this.fetchVazhipadDetails(vazhipadCode);
      this.getBlockingvazipadDate(this.selectedVazhipadItem.VM_Id);
      this.getDatamasterdateCheck(this.selectedVazhipadItem.VM_Id)
    } else {
      console.error('Selected vazhipad item not found in VMList');
    }
  }

  fetchVazhipadDetails(vazhipadcode: string): void {
    this.masterservice
      .getVazhipadeByCode(vazhipadcode)
      .subscribe((res: any) => {
        console.log(res, 'vazhipad details');
        if (res[0].VM_Amt != 0) {
          this.form.get('Rate')?.setValue(res[0].VM_Amt);
        } else {
          this.form.get('Rate')?.setValue('');
        }
        this.form.get('multiName')?.setValue(res[0].VM_MultiName);
        this.form.get('VTime')?.setValue(res[0].VM_Time);
        // this.form.get('VM_MaxNo')?.setValue(res[0].VM_MaxNo);
        this.rateChange = res[0].VM_Rate_Change;
        const booking = res[0].VM_Booking;
        const receipt = res[0].VM_Receipt;
        this.VM_MaxNo=res[0].VM_MaxNo;
        console.log(this.VM_MaxNo,"vVM_MaxNo value")
        if(this.VM_MaxNo>0){
          this.form.get("NoOfDays")?.setValue(this.VM_MaxNo);
        }else{
          this.calculateTotalAmount();
        }
        
        
        this.masterservice
          .getVazhipadByCodeForDiety(vazhipadcode)
          .subscribe((data: any) => {
            this.prathishtaOptions = data;
            console.log(this.prathishtaOptions);
            if (this.prathishtaOptions.length > 0) {
              if (this.lang === 'en') {
                const defaultPrathishta = this.prathishtaOptions[0].PM_Name;
                const defaultPrathishtaId = this.prathishtaOptions[0].PM_ID;
                console.log(this.prathishtaOptions[0].PM_Name);
                this.form.get('Prethista')?.setValue(defaultPrathishta);
                this.form.get('PMid')?.setValue(defaultPrathishtaId);
              } else if (this.lang == 'ml') {
                const defaultPrathishta = this.prathishtaOptions[0].PM_RegName;
                const defaultPrathishtaId = this.prathishtaOptions[0].PM_ID;
                console.log(this.prathishtaOptions[0].PM_RegName);
                this.form.get('Prethista')?.setValue(defaultPrathishta);
                this.form.get('PMid')?.setValue(defaultPrathishtaId);
              }
            }
          });
      });
  }

  calculateTotalAmount() {
    const qty = parseInt(this.form.get('Qty')!.value, 10);
    const rate = parseInt(this.form.get('Rate')!.value, 10);
    const noOfDays = parseInt(this.form.get('NoOfDays')!.value, 10);
    const calculatedQty = qty * noOfDays;
    this.totalAmount = calculatedQty * rate;
    this.updateTotalAmount();
  }

  updateTotalAmount() {
    const rate = this.form.get('Rate')?.value || 0;
    const qty = this.form.get('Qty')?.value || 0;
    const noOfDays = this.form.get('NoOfDays')?.value || 0;
    const calculatedQty = qty * noOfDays;
    const initialAmount = rate * calculatedQty;
  }

  onSubmit() {
    const vid = this.form.get('Vazhid')?.value;

    // Fetch seasonal date validation data
    this.masterservice.getSeasonalVazhipadDateCheck(vid).subscribe({
      next: (data) => {
        console.log(data, 'Seasonal Vazhipad Date Check Response');

        if (data && data.length > 0) {
          this.seasonalDates = {
            fromDate: data[0].VS_FromDate,
            toDate: data[0].VS_ToDate,
          };
          console.log(this.seasonalDates, 'Seasonal Dates');
        } else {
          this.seasonalDates = null// Clear previous data if no seasonal range is returned
        }

        this.validateAndSubmit(); // Proceed with validation after receiving data
      },
      error: (err) => {
        console.error('Error fetching seasonal dates:', err);
        this.notification.showError(
          'Failed to validate seasonal dates. Please try again later.',
          'Error'
        );
      },
    });
  }

  convertWithDatePipe(dateString: string): string {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Create a valid Date object
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  validateAndSubmit() {
    const enteredFromDate = this.form.get('VazhipadDate')?.value;
    const enteredToDate = this.form.get('EndDate')?.value;
    console.log(enteredFromDate, enteredToDate, 'entered dates');

    // Seasonal date validation
    if (this.seasonalDates) {
      // const seasonalFromDate = new Date(this.seasonalDates.fromDate);
      // const seasonalToDate = new Date(this.seasonalDates.toDate);
      const seasonaldateValidate = this.isDateWithinRange(
        enteredFromDate,
        enteredToDate,
        this.seasonalDates.fromDate,
        this.seasonalDates.toDate
      )
      if (
        seasonaldateValidate === false
      ) {
        console.log(seasonaldateValidate, "vaidation after")
        this.notification.showError(
          `The selected dates are not within the allowed range `,
          'Invalid Dates'
        );
        return; // Stop submission
      }
    }
    console.log(this.form.valid, "vaidate forms sssssssssssssssssssssss")
    // Proceed with form submission if validation passes
    if (this.form.valid && this.devotees.valid) {
      const formValues = this.form.value;
      console.log(formValues, "forms valuessssssssssssssssssssssssssssssssssssssssssssssssssssssss")
      const devoteeArray = formValues.devotees.map((devotee: any) => ({
        Slno: '',
        PMid: formValues.PMid,
        Vazhid: formValues.Vazhid,
        Prethista: formValues.Prethista,
        Vazhipad: formValues.Vazhipad,
        Name: devotee.Name,
        Star: devotee.Star,
        Name2: devotee.Name2,
        Star2: devotee.Star2,
        Qty: formValues.Qty,
        Rate: formValues.Rate,
        Amount: (formValues.Qty * formValues.Rate).toString(),
        TotalAmt: (
          formValues.Qty *
          formValues.Rate *
          formValues.NoOfDays
        ).toString(),
        Postal: '0',
        VazhipadDate: formValues.VazhipadDate,
        Mday: formValues.Mday,
        NalBy: formValues.NalBy,
        Mmonth: formValues.Mmonth,
        VTime: '1',
        FromDate: this.convertWithDatePipe(formValues.FromDate),
        ToDate: this.convertWithDatePipe(formValues.EndDate),
      }));

      const finalArray: any[] = [];
      this.multiDayList.forEach((item: any) => {
        const disdate = item.disdate;
        const dateParts = disdate.split('/');
        const formattedDisdate = new Date(
          +dateParts[2],
          +dateParts[1] - 1,
          +dateParts[0]
        );

        devoteeArray.forEach((devotee: any) => {
          finalArray.push({ ...devotee, VazhipadDate: formattedDisdate });
        });
      });

      console.log(finalArray, "data with additions added newly");
      const VM_MaxNo=this.VM_MaxNo
      // this.dialogRef.close({finalArray,VM_MaxNo});
    } else {
      this.showValidationErrors();
      this.form.markAllAsTouched();
      this.validateDevoteeName();
    }
  }

  formatToDDMMYYYY(dateString: string): string {
    const date = new Date(dateString); // Parse the date string
    const day = String(date.getDate()).padStart(2, '0'); // Get the day with leading zero
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed)
    const year = date.getFullYear(); // Get the year
    return `${day}-${month}-${year}`; // Return in dd-MM-yyyy format
  }
 

  formatToDDMMYYYYDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  isDateWithinRange(
    enteredFromDate: any,
    enteredToDate: any,
    seasonalFromDate: any,
    seasonalToDate: any
  ): boolean {
    const seasonalFromDates = this.formatToDDMMYYYY(seasonalFromDate);
    const seasonalToDates = this.formatToDDMMYYYY(seasonalToDate);
    const enteredFromDates = this.formatToDDMMYYYY(enteredFromDate);

    const [day, month, year] = enteredToDate.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    const enteredToDates = this.formatToDDMMYYYYDate(endDate)
    console.log(seasonalFromDates, seasonalToDates, enteredFromDates, enteredToDates, "after data formt ")
    console.log(typeof (seasonalFromDates), typeof (seasonalToDates), typeof (enteredFromDates), typeof (enteredToDates), "after data formt types ")
    console.log(enteredFromDates >= seasonalFromDates &&
      enteredToDates <= seasonalToDates &&
      enteredFromDates <= enteredToDates, "to know the output ");

    return (
      enteredFromDates >= seasonalFromDates &&
      enteredToDates <= seasonalToDates &&
      enteredFromDates <= enteredToDates
    );
  }


  cancel() {
    // this.dialogRef.close();
  }


  vazhipadtime = [
    { id: '0', key: 'TIME1' },
    { id: '1', key: 'TIME2' },
    { id: '2', key: 'TIME3' },
    { id: '3', key: 'TIME4' },
  ];

  getMalayalamMonthList() {
    const payLoad = { Type: 'MalMonth', code: '' };
    this.masterservice.getMalayalamMonthList(payLoad).subscribe({
      next: (data) => {
        this.malayalamMonthList = data;
        console.log(this.malayalamMonthList);
      },
    });
  }

  getmultidayfilterData() {
    const engMonth = this.multidayFilterForm.get('EngMonth')?.value;
    const malMonth = this.multidayFilterForm.get('MalMonth')?.value;
    const star = this.multidayFilterForm.get('Star')?.value;
    const englishday = this.multidayFilterForm.get('EngishDay')?.value;
    const malday = this.multidayFilterForm.get('MalDay')?.value;
    const thithi = this.multidayFilterForm.get('Thithi')?.value;
    this.form.patchValue({
      Mday: engMonth,
      NalBy: star,
      Mmonth: malMonth,
      SearchBy: thithi
    });
    console.log(englishday);
    let type: string | null = null;
    if (star && englishday && !engMonth && !malMonth && !malday && !thithi) {
      type = 'EDayStar';
    } else if (
      star &&
      malday &&
      malMonth &&
      !engMonth &&
      !englishday &&
      !thithi
    ) {
      type = 'StarMDayMDate';
    } else if (
      star &&
      engMonth &&
      !malMonth &&
      !englishday &&
      !malday &&
      !thithi
    ) {
      type = 'StarDay';
    } else if (
      star &&
      !engMonth &&
      !malMonth &&
      !englishday &&
      !malday &&
      !thithi
    ) {
      type = 'Star';
    } else if (
      malMonth &&
      star &&
      !engMonth &&
      !englishday &&
      !malday &&
      !thithi
    ) {
      type = 'MalStar';
    } else if (
      malMonth &&
      star &&
      engMonth &&
      !englishday &&
      !malday &&
      !thithi
    ) {
      type = 'Both';
    } else if (
      star &&
      malday &&
      !engMonth &&
      !malMonth &&
      !englishday &&
      !thithi
    ) {
      type = 'MDaystar';
    } else if (
      star &&
      engMonth &&
      englishday &&
      !malMonth &&
      !malday &&
      !thithi
    ) {
      type = 'StarDayEngDate';
    } else if (
      malMonth &&
      !star &&
      !engMonth &&
      !englishday &&
      !malday &&
      !thithi
    ) {
      type = 'MalMonth';
    } else if (
      malMonth &&
      engMonth &&
      !star &&
      !englishday &&
      !malday &&
      !thithi
    ) {
      type = 'MalEng';
    } else if (
      malday &&
      malMonth &&
      !star &&
      !engMonth &&
      !englishday &&
      !thithi
    ) {
      type = 'MDayMDate';
    } else if (
      malday &&
      malMonth &&
      engMonth &&
      !star &&
      !englishday &&
      !thithi
    ) {
      type = 'MDayMDateEDay';
    } else if (
      engMonth &&
      !star &&
      !malMonth &&
      !englishday &&
      !malday &&
      !thithi
    ) {
      type = 'EngDay';
    } else if (engMonth && englishday) {
      type = 'DayEngDate';
    } else if (
      englishday &&
      !star &&
      !engMonth &&
      !malMonth &&
      !malday &&
      !thithi
    ) {
      type = 'EngDate';
    } else if (
      thithi &&
      !star &&
      !engMonth &&
      !malMonth &&
      !englishday &&
      !malday
    ) {
      type = 'Thithi';
    } else if (
      !thithi &&
      star &&
      engMonth &&
      !malMonth &&
      !englishday &&
      malday
    ) {
      type = 'StarDayMDate';
    } else if (
      !thithi &&
      !star &&
      engMonth &&
      !malMonth &&
      !englishday &&
      malday
    ) {
      type = 'DayMDate';
    } else if (
      !thithi &&
      !star &&
      !engMonth &&
      !malMonth &&
      !englishday &&
      malday
    ) {
      type = 'MDate';
    } else {
      type = 'NULL';
    }

    const formattedDate = this.datePipe.transform(
      this.form.get('VazhipadDate')?.value,
      'dd-MM-yyyy'
    );
    const payLoad = {
      ...this.multidayFilterForm.value,
      Type: type,
      NoofDays: this.form.get('NoOfDays')?.value,
      VazhipadDate: formattedDate,
    };
    console.log(payLoad, "multiday filter console");
    this.masterservice.getMultidyaFilterinddata(payLoad).subscribe({
      next: (data: multiDayFilter) => {
        console.log(data);
        const dayList = Array.isArray(data) ? data : [data];
        this.updatedDayList = Array.isArray(data) ? data : [data];

        // this.multiDayList = Array.isArray(data) ? data : [data];

        this.updatedDayList = dayList.map((item: any) => ({
          ...item,
          selected: true, // Set the initial value to true for all dates
        }));
        console.log(this.multiDayList, 'day listtttttttttttttttttttt');
        this.multiDayList = [...this.updatedDayList];
this.validateVazhipadDate()
        //finding end date
        if (this.multiDayList.length > 0) {
          let lastItem = this.multiDayList[this.multiDayList.length - 1];
          let firstitem = this.multiDayList[0];
          // let lastDate = lastItem ? lastItem.date : null;
          const endDate = lastItem.edate1;
          this.form.patchValue({
            EndDate: this.datePipe.transform(endDate, 'dd-MM-YYYY'),
            FromDate: this.datePipe.transform(firstitem.edate1, 'dd-MM-YYYY'),
          });
          console.log('Last Date:', endDate);
          console.log(this.form.get('VazhipadDate'))
        }
      },
    });
   
  }

  onSearchClick() {
    this.getmultidayfilterData();
  }

  onCancelClick() {
    this.multidayFilterForm.patchValue({
      Star: '',
      EngMonth: '',
      MalMonth: '',
      EngishDay: '',
      MalDay: '',
      Thithi: '',
    });
    this.getmultidayfilterData();
    console.log('Filters have been cleared and the form reset.');
  }

  validateDevoteeName() {
    const devoteesArray = this.devotees.controls;
    devoteesArray.forEach((devotee, index) => {
      const nameControl = devotee.get('Name');
      if (nameControl?.invalid && nameControl.touched) {
        this.notification.showError(
          `Devotee ${index + 1}- Please enter the Name!`,
          'Name is invalid'
        );
      }
    });
  }

  vazhipadValidator(control: AbstractControl): ValidationErrors | null {
    const vazhipad = control.value;
    var vmExists;
    if (this.lang === 'en') {
      vmExists = this.VMList.some((vm) => vm.VM_Name === vazhipad);
    } else if (this.lang == 'ml') {
      vmExists = this.VMList.some((vm) => vm.VM_RName === vazhipad);
    }

    if (!vmExists) {
      return { invalidVazhipad: true };
    }
    return null;
  }

  onCheckboxChange(index: number): void {
    // Toggle the selected status of the date
    this.updatedDayList[index].selected = !this.updatedDayList[index].selected;

    // Filter out the unselected dates from the list
    this.multiDayList = this.updatedDayList.filter((item) => item.selected);

    console.log(
      this.multiDayList,
      'Updated multiDayList after checkbox change'
    );

    if (this.multiDayList.length > 0) {
      let lastItem = this.multiDayList[this.multiDayList.length - 1];
      let lastDate = lastItem ? lastItem.date : null;
      let firstItem = this.multiDayList[0];
      const endDate = lastItem.edate1;
      this.form.patchValue({
        EndDate: this.datePipe.transform(endDate, 'dd-MM-YYYY'),
        VazhipadDate: firstItem.edate1
      });
      console.log('Last Date:', endDate);
    }
  }

  validateVazhipadDate() {
    const vazhipadDateControl = this.form.get("VazhipadDate");
  
    if (!this.updatedDayList || this.updatedDayList.length === 0) {
      console.log("No dates found to validate.");
      vazhipadDateControl?.setErrors(null);
      return;
    }
  
    // Convert selected dates to dd-mm-yyyy format
    this.formattedDates = this.updatedDayList.map(item => {
      const [day, month, year] = item.disdate.split("/");
      return `${day}-${month}-${year}`;
    });
  
    console.log("Formatted Selected Dates:", this.formattedDates);
  
    let errorMessages: string[] = [];
  
    // / Step 1: Validate Against Allowed Days ***/
    if (this.allowedDays && this.allowedDays.length > 0) {
      const invalidDates: { date: string; day: string }[] = [];
  
      this.formattedDates.forEach(dateStr => {
        const dayName = this.getDayName(dateStr);
        console.log(`Date: ${dateStr} - Day: ${dayName}`);
  
        if (!this.allowedDays.includes(dayName)) {
          invalidDates.push({ date: dateStr, day: dayName });
        }
      });
  
      if (invalidDates.length > 0) {
        const allowedErrorMessage = `Invalid selection! Only these days are allowed: ${this.allowedDays.join(", ")}`;
        errorMessages.push(allowedErrorMessage);
      }
    }
  
    /***  Step 2: Validate Against Blocked Dates ***/
    if (this.blockingArray && this.blockingArray.length > 0) {
      const blockedDates = this.blockingArray.map(item => {
        const date = new Date(item.VBDate);
        return date.toLocaleDateString("en-GB").split("/").join("-"); // Converts to dd-mm-yyyy
      });
  
      console.log("Blocked Dates:", blockedDates);
  
      const blockedConflicts = this.formattedDates.filter(date => blockedDates.includes(date));
  
      if (blockedConflicts.length > 0) {
        const blockErrorMessage = `Invalid selection! These dates are blocked: ${blockedConflicts.join(", ")}`;
        errorMessages.push(blockErrorMessage);
      }
    }
  
    /***  Step 3: Show Errors or Clear Validation ***/
    if (errorMessages.length > 0) {
      const finalErrorMessage = errorMessages.join("\n");
      vazhipadDateControl?.setErrors({ invalidVazhipadDate: finalErrorMessage });
  
      // Show Toastr error message
      this.notification.showError(finalErrorMessage, "Validation Error");
    } else {
      vazhipadDateControl?.setErrors(null);
    }
  }
  
  getDayName(dateStr: string): string {
    const [day, month, year] = dateStr.split("-");
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString("en-US", { weekday: "long" }); // Get full day name
  }


  private dayMapping: { [key: number]: string } = {
    1: 'Sunday',
    2: 'Monday',
    3: 'Tuesday',
    4: 'Wednesday',
    5: 'Thursday',
    6: 'Friday',
    7: 'Saturday'
  };

  getBlockingvazipadDate(vmId:any){
    const payLoad={Type:"BlockingALL",Code:vmId }
    this.masterservice.getMaster(payLoad).subscribe({next:(data)=>{
    console.log(data,"datablocing");
    this.blockingArray=data;
    },error:(err)=>{
      console.log(err)
    }
    })
  }

  getDatamasterdateCheck(vid:string){
    this.masterservice.getDayMastervazhipaddateCheck(vid).subscribe({
      next: (data) => {
        console.log(data, "day master");
        // this.dayArray
        console.log(data, "day master");
        const allowedDays = data.map((item: any) => item.Day);
        this.allowedDays = allowedDays.map(dayId => this.dayMapping[dayId] || 'Unknown');
      console.log('Allowed Days (IDs):', allowedDays);
      console.log('Allowed Days (Names):', this.allowedDays);

      },error:(err)=>{
          console.log(err);

        }
      })
  }


  



  getNameAndStarByMobilenumber(){

    console.log(this.mobileNumber,"mobile number data");
   
   console.log(this.memberDevoteeCheck,"dsssssssssssssss");
    if(this.mobileNumber){
     // this.masterService.getMaster
    //  this.customerdetailsForBillingForm.patchValue({
    //    Mobile:this.mobileNumber
    //  })
     const data={
       mobile:this.mobileNumber,
       member:this.memberDevoteeCheck
     }
    //  this.receiptPrinrservice.setMobileNumber(data);
     console.log('Mobile number sent:', this.mobileNumber);
     this.openBillingDialog(this.mobileNumber)
    }else{
     this.notification.showError("Please enter the valid mobile number and try again");
   }
   
   }
   
openBillingDialog(mobileNumber: any) {
  const data={
    mobile: mobileNumber, member: this.memberDevoteeCheck 
  }
    const dialogRef = this.dialog.open(BillingViaMobilenumberComponent, {
      width: '600px',
      data: data, 
    });

    // Handle dialog result
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Selected Rows:', result);
      this.nameStarArray = result.selectedData;
      if (result) {
       console.log(this.nameStarArray,"checking name star data")
       this.devotees.clear();
       this.nameStarArray.forEach((devotee:any) => {
        this.devotees.push(this.fb.group({
          Name: [devotee.Name || '', [Validators.required]],
          Star: [this.getStarIdByNames(devotee.Star) || '', [Validators.required]],
          Name2: [''], // Optional fields
          Star2: [''],
        }));
      });
      }
    });
  }



  getStarIdByNames(starName: string): number | null {
    const searchField = this.lang == 'en' ? 'SM_NameEng' : 'SM_Name';

    const star = this.nakshatham.find(n => n[searchField] === starName);
    return star ? star.id : null; // Return ID if found, otherwise return null
  }





}

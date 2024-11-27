// import { multiDayFilter } from './../../../models/multidayFilter.model';
import { Component, inject, Inject, OnInit } from '@angular/core';
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
import { AsyncPipe, CommonModule, DatePipe, formatDate } from '@angular/common';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { map, Observable, of, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../../services/master/master.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { multiDayFilter } from '../../../models/multidayFilter.model';
@Component({
  selector: 'app-multidayitems',
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
    FormsModule,
    MatInputModule,
    NumberDirective,
  ],
  templateUrl: './multidayitems.component.html',
  styleUrl: './multidayitems.component.css',
  providers: [DatePipe],
})
export class MultidayitemsComponent implements OnInit {
  form: FormGroup;
  filteredOptions: Observable<any[]>;
  starData: Observable<any[]>;
  VMList: any[] = [];
  nakshatham: any[];
  thithiList: any[] = [];
  prathishtaOptions: any[] = [];
  totalAmount: number = 0;
  tomorrowDate: Date;
  minDate: any;
  amountPerDevotee: number = 0;
  // dayList: { date: Date | string; kollavarshamData: any }[] = [];
  // kollavarsham: any[] = [];
  daysList: any[] = [];
  updatedDayList: any[] = [];
  devotees: FormArray;
  rateChange: string = 'N';
  seasonalDates: { fromDate: any; toDate: any } | null = null;
  allowedDays: number[] = [];
  currentDate = new Date();
  filteredStars: Observable<string[]>[] = [];
  starList: string[] = [];
  MlayalamDays = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
  ];
  EnglishDays = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    ' 17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    ' 24',
    '25',
    '26',
    '27',
    ' 28',
    ' 29',
    '30',
    '31',
  ];
  malayalamMonthList: any[];
  multidayFilterForm: FormGroup;
  multiDayList: multiDayFilter[] = [];
  updatedmultiDayList: multiDayFilter[] = [];
  lastChanged: 'English' | 'Malayalam' | null = null;

  private readonly masterservice = inject(MasterService);
  constructor(
    private fb: FormBuilder,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<MultidayitemsComponent>,
    private datePipe: DatePipe
  ) {
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
      multiname: [{ disabled: true, value: '' }],
      booking: [{ disabled: true, value: '' }],
      ratechange: [{ disabled: true, value: '' }],
      VM_Receipt: [{ disabled: true, value: '' }],
      // allowedDays: this.fb.array([]),
      // dateToSet: [''],
      // seasonalDates: this.fb.group({
      //   fromDate: [''],
      //   toDate: [''],
      // }),
      devotees: this.fb.array([this.createDevotee()]),
    });
    this.devotees = this.form.get('devotees') as FormArray;
    this.setDefaultVazhipadDate();
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
      Star: ['',[Validators.required] ],
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

  setUpstarAutocomplete(){
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
    return this.nakshatham.filter((star) => star.SM_NameEng.toLowerCase().includes(filterValue));
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

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.VMList.filter(
      (option) =>
        option.VM_Name.toLowerCase().includes(filterValue) ||
        option.VM_Code.toLowerCase().includes(filterValue)
    );
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
      }));
    });
  }

  setupAutocomplete() {
    this.filteredOptions = this.form.get('Vazhipad')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  // autoCompleteForStar() {
  //   this.starData = this.form.get('Star')!.valueChanges.pipe(
  //     startWith(''),
  //     map((value) => this._filterStar(value || ''))
  //   );
  // }

  onSelectStar(index: number, event: MatAutocompleteSelectedEvent): void {
    const selectedStar = event.option.value;
    const devoteesArray = this.form.get('devotees') as FormArray;
    devoteesArray.at(index).get('Star')?.setValue(selectedStar);
  }

  onSelect(event: MatAutocompleteSelectedEvent): void {
    const selectedVazhipad = event.option.value;
    this.form.get('Vazhipad')?.setValue(selectedVazhipad);
    const selectedVazhipadItem = this.VMList.find(
      (item) => item.VM_Name === selectedVazhipad
    );
    console.log(selectedVazhipadItem);
    if (selectedVazhipadItem) {
      // Fetch vazhipad details using VM_Code
      console.log(selectedVazhipadItem);
      this.form.get('Vazhid')?.setValue(selectedVazhipadItem.VM_Id);
      const vazhipadCode = selectedVazhipadItem.VM_Code;
      console.log(vazhipadCode);
      this.fetchVazhipadDetails(vazhipadCode);
    } else {
      console.error('Selected vazhipad item not found in VMList');
      // Handle error or feedback if needed
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
        this.rateChange = res[0].VM_Rate_Change;
        const booking = res[0].VM_Booking;
        const receipt = res[0].VM_Receipt;
        const allowedDays =
          (this.form.get('allowedDays')?.value as number[]) || [];
        console.log(allowedDays + 'fffffffffffffffffffffff');
        this.calculateTotalAmount();
        this.masterservice
          .getVazhipadByCodeForDiety(vazhipadcode)
          .subscribe((data: any) => {
            this.prathishtaOptions = data;
            console.log(this.prathishtaOptions);
            if (this.prathishtaOptions.length > 0) {
              const defaultPrathishta = this.prathishtaOptions[0].PM_Name;
              const defaultPrathishtaId = this.prathishtaOptions[0].PM_ID;
              console.log(this.prathishtaOptions[0].PM_Name);
              this.form.get('Prethista')?.setValue(defaultPrathishta);
              this.form.get('PMid')?.setValue(defaultPrathishtaId);
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
    if (this.form.valid && this.devotees.valid) {
      const formValues = this.form.value;
      console.log(formValues);
      const devoteeArray = formValues.devotees.map((devotee: any) => {
        return {
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
          Mday: '',
          NalBy: '',
          Mmonth: '',
          VTime: '1',
        };
      });
      console.log(devoteeArray);
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

      console.log(finalArray);
      this.dialogRef.close(finalArray);
    } else {
      this.showValidationErrors();
      this.form.markAllAsTouched();
      this.validateDevoteeName();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  vazhipadtime = [
    { id: '0', name: 'Any Time' },
    { id: '1', name: 'Morning' },
    { id: '2', name: 'Evening' },
    { id: '3', name: 'AfterNoon' },
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
  Mday:engMonth,
  NalBy:star,
  Mmonth: malMonth,
})
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
    console.log(payLoad);
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

        //finding end date
        if (this.multiDayList.length > 0) {
          let lastItem = this.multiDayList[this.multiDayList.length - 1];
          let lastDate = lastItem ? lastItem.date : null;
          const endDate = lastItem.edate1;
          this.form.patchValue({
            EndDate: this.datePipe.transform(endDate, 'dd-MM-YYYY'),
          });
          console.log('Last Date:', endDate);
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
    const vmExists = this.VMList.some((vm) => vm.VM_Name === vazhipad);
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
      const endDate = lastItem.edate1;
      this.form.patchValue({
        EndDate: this.datePipe.transform(endDate, 'dd-MM-YYYY'),
      });
      console.log('Last Date:', endDate);
    }

   
  }




}

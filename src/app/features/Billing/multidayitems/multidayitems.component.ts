import { Component, inject, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NumberDirective } from '../../../shared/directives/number/number.directive';

import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { AsyncPipe, CommonModule, DatePipe, formatDate } from '@angular/common';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../../services/master/master.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { minDateValidator } from '../../../shared/validator/min-date.validator';
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
  prathishtaOptions: any[] = [];
  totalAmount: number = 0;
  tomorrowDate: Date;
  minDate:any;
  amountPerDevotee: number = 0;
  dayList: { date: Date | string; kollavarshamData: any }[] = [];
  kollavarsham: any[] = [];
  daysList: any[] = [];
  devotees: FormArray;
  rateChange: string = 'N';
  private readonly masterservice = inject(MasterService);
  constructor(
    private fb: FormBuilder,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<MultidayitemsComponent>,
    private datePipe: DatePipe
  ) {
    this.tomorrowDate = new Date();
   
    this.form = this.fb.group({
      Vazhipad: ['', Validators.required,],
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
      VazhipadDate: ['', [Validators.required,minDateValidator(this.tomorrowDate)]],
      time: [{ disabled: true, value: '' }],
      Postal: ['10'],
      Mday: ['Sunday'],
      NalBy: ['Ohm'],
      Mmonth: ['Chingam'],
      multiname: [{ disabled: true, value: '' }],
      booking: [{ disabled: true, value: '' }],
      ratechange: [{ disabled: true, value: '' }],
      devotees: this.fb.array([this.createDevotee()]),
    });
    this.devotees = this.form.get('devotees') as FormArray;
  }

  createDevotee(): FormGroup {
    return this.fb.group({
      Name: ['', [Validators.required]],
      Star: ['28', [Validators.required]],
      Name2: [''],
      Star2: [''],
    });
  }

  addDevotee() {
    if (this.form.invalid) {
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
      this.notification.showError(
        'Enter a valid date',
        'Validation Error'
      );
    }
    if (this.form.get('Rate')?.invalid) {
      this.notification.showError(
        'Enter a valid Rate',
        'Validation Error'
      );
    }
    const vazhipadDateControl = this.form.get('VazhipadDate');
    if (vazhipadDateControl?.errors?.['minDate']) {
      this.notification.showError(
        'The date must be on or after tomorrow.',
        'Validation Error'
      );
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
    this.getAllvazhipad();
    this.setupAutocomplete();
    this.getNakshthram();
    this.watchDateChanges();
    this.setDefaultDates();
    this.getKollavarasham();
    this.subscribeToQtyAndRateChanges();
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.VMList.filter(
      (option) =>
        option.VM_Name.toLowerCase().includes(filterValue) ||
        option.VM_Code.toLowerCase().includes(filterValue)
    );
  }

  private _filterStar(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.nakshatham.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  getNakshthram() {
    const payLoad={"Type":"ListStar","Code":""};
    this.masterservice.getStarData(payLoad).subscribe((res) => {
      this.nakshatham = res;
      console.log(this.nakshatham);
      // this.autoCompleteForStar();
    });
  }

  getAllvazhipad() {
    this.masterservice.getVmaster().subscribe((data) => {
      // console.log(data);
      // this.VMList=data
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

  autoCompleteForStar() {
    this.starData = this.form.get('Star')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterStar(value || ''))
    );
  }

  onSelectStar(event: MatAutocompleteSelectedEvent): void {
    const selectedStar = event.option.value;
    this.form.get('Star')?.setValue(selectedStar);
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
        console.log(res);
        this.form.get('Rate')?.setValue(res[0].VM_Amt);
        this.form.get('multiName')?.setValue(res[0].VM_MultiName);
        this.rateChange = res[0].VM_Rate_Change;
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

  private setDefaultDates() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.minDate = this.formatDate(tomorrow);
    const formattedDate = this.datePipe.transform(tomorrow, 'yyyy-MM-dd');
    this.form.get('VazhipadDate')?.setValue(formattedDate);
    this.calculateEndDate();
    this.generateDayList();
  }

  watchDateChanges() {
    this.form.get('VazhipadDate')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
      this.generateDayList();
    });

    this.form.get('NoOfDays')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
      this.generateDayList();
    });
  }

  calculateEndDate() {
    const VazhipadDate = this.form.get('VazhipadDate')?.value;
    const noOfDays = +this.form.get('NoOfDays')?.value || 1;
    console.log(typeof noOfDays);
    if (VazhipadDate) {
      const start = new Date(VazhipadDate);
      const end = new Date(start);
      end.setDate(start.getDate() + noOfDays - 1);
      console.log(end + 'dghjs');
      const formattedDate = this.formatDate(end);
      this.form.get('EndDate')?.setValue(formattedDate);
      console.log(end + 'end');
    }
  }

  subscribeToQtyAndRateChanges() {
    this.form.get('Rate')?.valueChanges.subscribe(() => {
      this.calculateTotalAmount();
    });

    this.form.get('Qty')?.valueChanges.subscribe(() => {
      this.calculateTotalAmount();
    });

    this.form.get('NoOfDays')?.valueChanges.subscribe(() => {
      this.calculateTotalAmount();
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
    // this.totalAmount = initialAmount + this.devotees.length * initialAmount;
  }

  getKollavarasham() {
    this.masterservice.kollavarashamData().subscribe((res) => {
      console.log(res);
      this.kollavarsham = res;
      this.generateDayList();
    });
  }

  private dateFormat(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  generateDayList() {
    const VazhipadDate = new Date(this.form.get('VazhipadDate')?.value);
    const endDate = new Date(this.form.get('EndDate')?.value);

    this.dayList = [];
    if (VazhipadDate && endDate) {
      let currentDate = new Date(VazhipadDate);
      while (currentDate <= endDate) {
        console.log(currentDate <= endDate);
        const formattedDate = this.dateFormat(currentDate);
        const kollavarshamData =
          this.kollavarsham.find((k) => k.disdate === formattedDate) || {};
        this.dayList.push({ date: formattedDate, kollavarshamData });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }

  generateArrayOfFormValues() {
    const VazhipadDate = new Date(this.form.get('VazhipadDate')?.value);
    const noOfDays = +this.form.get('NoOfDays')?.value || 1;
    const formValuesArray = [];

    for (let i = 0; i < noOfDays; i++) {
      const currentDay = new Date(VazhipadDate);
      currentDay.setDate(VazhipadDate.getDate() + i);

      const formValue = {
        ...this.form.value,
        VazhipadDate: currentDay,
      };

      formValuesArray.push(formValue);
    }

    return formValuesArray;
  }

  onSubmit() {
    if (this.form.valid && this.devotees.valid) {
      const formValues = this.form.value;
      const devoteeArray = formValues.devotees.map((devotee: any) => {
        return {
          Slno: '',
          PMid: formValues.PMid,
          Vazhid: '1',
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
          Postal: '10',
          VazhipadDate: formValues.VazhipadDate,
          Mday: 'Sunday',
          NalBy: 'Ohm',
          Mmonth: 'Chingam',
        };
      });
      console.log(devoteeArray);

      const startDate = new Date(formValues.VazhipadDate);
      const noOfDays = formValues.NoOfDays;
      const finalArray: any[] = [];

      for (let i = 0; i < noOfDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const vachipadDate = currentDate;

        devoteeArray.forEach((devotee: any) => {
          finalArray.push({ ...devotee, VazhipadDate: vachipadDate });
        });
      }

      console.log(finalArray);
      this.dialogRef.close(finalArray);
    } else {
      this.showValidationErrors();
    }
  }
  cancel(){
    this.dialogRef.close();
  }
  
}

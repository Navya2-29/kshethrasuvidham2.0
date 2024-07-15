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
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../../services/master/master.service';

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
  ],
  templateUrl: './multidayitems.component.html',
  styleUrl: './multidayitems.component.css',
})
export class MultidayitemsComponent implements OnInit {
  form: FormGroup;

  filteredOptions: Observable<any[]>;
  starData: Observable<any[]>;
  VMList: any[] = [];
  nakshatham: any[];
  prathishtaOptions: any[] = [];
totalAmount:number=0;
tomorrowDate: string;
amountPerDevotee: number = 0;
  private readonly masterservice = inject(MasterService);
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      Vazhipad: [''],
      Rate: [''],
      Qty: ['1'],
      Star: [''],
      NoOfDays: ['1'],
      StartDate: [''],
      EndDate: [''],
      Prathista: [''],
      PMid: [''],
      multiName: [''],
      devotees: this.fb.array([]) 
    });
  }


  get devotees(): FormArray {
    return this.form.get('devotees') as FormArray;
  }

  addDevotee() {
    const devoteeGroup = this.fb.group({
      name: ['', Validators.required],
      star: ['', Validators.required],
      name2: this.form.get('multiName')?.value === 'Y' ? ['', Validators.required] : null,
      star2: this.form.get('multiName')?.value === 'Y' ? ['', Validators.required] : null
    });
    this.devotees.push(devoteeGroup);
    // Calculate the amount for this devotee
    

    // Add this amount to the totalAmount
    this.updateTotalAmount();
  }

  removeDevotee(index: number) {
    this.updateTotalAmount();
    this.devotees.removeAt(index);
  }
  ngOnInit() {
    this.getAllvazhipad();
    this.setupAutocomplete();
    this.getNakshthram();
    this.watchDateChanges();
    this.setDefaultDates();
   
    this.subscribeToQtyAndRateChanges();
  }

  selectedVazhipadPrathistaDetails(vazhipadcode: any, index: number) {
    this.masterservice.getVazhipadByCodeForDiety(vazhipadcode).subscribe({
      next: (res: any) => {
        console.log(res);
        this.prathishtaOptions = res.map((item: any) => ({
          id: item.PM_ID,
          name: item.PM_Name,
        }));

        if (this.prathishtaOptions.length > 0) {
          console.log(this.prathishtaOptions[index]);
          const defaultPrathishta = this.prathishtaOptions[0].name;
          const defaultPrathishtaId = this.prathishtaOptions[0].id;
          console.log(defaultPrathishta);
          this.form.get('Prethista')?.setValue(defaultPrathishta);
          this.form.get('PMid')?.setValue(defaultPrathishtaId);

          this.form
            .get('Prethista')
            ?.valueChanges.subscribe((selectedPrathishta) => {
              const selectedPrathishtaObj = this.prathishtaOptions.find(
                (option: any) => option.name === selectedPrathishta
              );
              if (selectedPrathishtaObj) {
                this.form.get('PMid')?.setValue(selectedPrathishtaObj.id); // Set PMid based on selected Prathishta
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
    this.masterservice.getNakshthra().subscribe((res) => {
      this.nakshatham = res;
      console.log(this.nakshatham);
      this.autoCompleteForStar();
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
        // if (isVMBooking==='Y') {
          this.calculateTotalAmount();
        //   selectedRow.get('minDate')?.setValue(this.tomorrowDate);
        // } else {
        //   selectedRow.get('VazhipadDate')?.disable();
        //   selectedRow.get('minDate')?.setValue(this.today);
        // }
        // this.selectedVazhipadPrathistaDetails(vazhipadcode);
        // //   selectedRow.get('rate')?.setValue(res.rate);
        // console.log(selectedRow);
      });
  }

  private setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    this.tomorrowDate = this.formatDate(tomorrow);
    this.form.get('StartDate')?.setValue(this.tomorrowDate);
    this.calculateEndDate();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  watchDateChanges() {
    this.form.get('StartDate')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
    });

    this.form.get('NoOfDays')?.valueChanges.subscribe(() => {
      this.calculateEndDate();
    });
  }

  calculateEndDate() {
    const startDate = new Date(this.form.get('StartDate')?.value);
    let noOfDays = this.form.get('NoOfDays')?.value || 0;

    if (noOfDays < 1) {
      noOfDays = 1; // Ensure minimum 1 day
    } else if (noOfDays == 1) {
      noOfDays = 1;
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      this.form.get('EndDate')?.setValue(tomorrow.toISOString().split('T')[0]);
    } else if (noOfDays > 1) {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + noOfDays - 1);
      this.form.get('EndDate')?.setValue(endDate.toISOString().split('T')[0]);
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

    this.totalAmount = initialAmount + (this.devotees.length * initialAmount);
  }
}

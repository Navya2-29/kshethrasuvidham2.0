import { Component, Inject, OnInit } from '@angular/core';
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
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { CommonModule } from '@angular/common';

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
  ],
  templateUrl: './multidayitems.component.html',
  styleUrl: './multidayitems.component.css',
})
export class MultidayitemsComponent implements OnInit {
  multiDayForm: FormGroup;
  dayList: string[] = [];
  initialRowData: any;
  generatedRows: any[] = [];
  DevoteeRows: any[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.multiDayForm = this.fb.group({
      startDate: ['', [Validators.required]],
      numberOfDays: ['1', [Validators.required, Validators.min(1)]],
      quantity: [
        this.data.Qty || '1',
        [Validators.required, Validators.min(1)],
      ],
      endDate: ['', [Validators.required]],
      devotees: this.fb.array([]),
    });
  }
  ngOnInit(): void {
    console.log(this.data);
    console.log(this.data.multiname);
    if (this.data?.quantity) {
      this.multiDayForm.patchValue({ quantity: this.data.Qty });
    }

    this.initialRowData = this.data;
    this.initDevoteeFormListener();

  }
  calculateEndDate(): void {
    const startDate = this.multiDayForm.get('startDate')?.value;
    const numberOfDays = this.multiDayForm.get('numberOfDays')?.value;

    if (startDate && numberOfDays) {
      const start = new Date(startDate);
      const end = new Date(start.getTime() + numberOfDays * 24 * 60 * 60 * 1000);
      this.multiDayForm.patchValue({
        endDate: end.toISOString().split('T')[0],
      });
      this.generateDayList(start, end);
      this.generateRows(start, end);
    } else {
      this.dayList = ["No day found"];
    }
  }
  // get devotees
  get devotees(): FormArray {
    return this.multiDayForm.get('devotees') as FormArray;
  }
  // add devotee
  addDevotee(): void {
    this.devotees.push(this.createDevoteeFormGroup());
    this.updateQuantity();
    const startDate = this.multiDayForm.get('startDate')?.value;
    const endDate = this.multiDayForm.get('endDate')?.value;
    if (startDate && endDate) {
      this.initDevoteeFormListener(); // Re-initialize listener for new devotee
    }
    
  }
  removeDevotee(index: number): void {
    this.devotees.removeAt(index);
    this.updateQuantityByDelete();
  }

  private updateQuantity(): void {
    const presentQuantity = this.data?.Qty ||1;
    const length = this.devotees.length;
    let newQuantity;
    newQuantity = presentQuantity * (length + 1);
    this.multiDayForm.patchValue({
      quantity: newQuantity,
    });
  }

  updateQuantityByDelete(){
    const presentQuantity = this.multiDayForm.get('quantity')?.value || 1;
    const length = this.data.Qty
    let newQuantity;
    newQuantity = length > 0 ? presentQuantity - length : length;
    this.multiDayForm.patchValue({
      quantity: newQuantity,
    });
  }
  private createDevoteeFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      star: ['', Validators.required],
    });
  }
  onSubmit() {
    console.log(this.multiDayForm.value);
    const allGeneratedRows = [...this.generatedRows, ...this.DevoteeRows];
    console.log(allGeneratedRows);
  }

  private generateDayList(startDate: Date, endDate: Date): void {
    const dayList = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dayList.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.dayList = dayList;
  }


  private generateRows(startDate: Date, endDate: Date): void {
    // Clear existing generated rows
    this.generatedRows = [];

    // Repeat initial row data for each date
    const initialRow = this.initialRowData;

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      initialRow.VazhipadDate = currentDate.toISOString().split('T')[0];
      const row = {
        ...initialRow,
       
      };
      this.generatedRows.push(row);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(this.generatedRows);
   
    
  }

  private generateDevoteeRows(): void {
    this.DevoteeRows = [];

    // Repeat initial row data for each date and each devotee
    let startDate = this.multiDayForm.get('startDate')?.value;
    let endDate = this.multiDayForm.get('endDate')?.value;

    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);

      this.devotees.controls.forEach(devoteeControl => {
        const name = devoteeControl.get('name')?.value;
        const star = devoteeControl.get('star')?.value;

        if (name && star) {
          let currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const row = {
              ...this.initialRowData,
              VazhipadDate: currentDate.toISOString().split('T')[0],
              Name:name,
              Star:star
            };
            this.DevoteeRows.push(row);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      });
    }

    console.log(this.DevoteeRows);
  }


  initDevoteeFormListener(): void {
    // Listen for changes in each devotee form group
    this.devotees.controls.forEach(devoteeControl => {
      devoteeControl.get('name')?.valueChanges.subscribe(() => {
        this.generateDevoteeRows();
      });

      devoteeControl.get('star')?.valueChanges.subscribe(() => {
        this.generateDevoteeRows();
      });
    });
  }

}

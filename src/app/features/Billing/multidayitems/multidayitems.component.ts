import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon'
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multidayitems',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatTableModule, MatCheckboxModule,MatIconModule,ReactiveFormsModule,CommonModule],
  templateUrl: './multidayitems.component.html',
  styleUrl: './multidayitems.component.css'
})
export class MultidayitemsComponent implements OnInit {
  rowIndex: number;
  name: string;
  star: string;


  multidayForm: FormGroup;
  dayList: { name: string, star: string, date: string }[] = [];
  devoteesList: { name: string, star: string, date: string[] }[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MultidayitemsComponent>,
    private multidayService: TotalAmountService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.rowIndex = this.data.rowIndex;
    this.name = this.data.name;
    this.star = this.data.star;
    this.initForm();
    this.updateEndDateAndDayList(); // Initialize day list
  }

  initForm(): void {
    this.multidayForm = this.fb.group({
      startDate: ['', Validators.required],
      days: [1, Validators.required],
      qty: [1, Validators.required],
      endDate: [{ value: '', disabled: true }],
      rows: this.fb.array([])
    });

    // Subscribe to changes in start date and days to update end date and day list
    this.multidayForm.get('startDate')!.valueChanges.subscribe(() => {
      this.updateEndDateAndDayList();
    });

    this.multidayForm.get('days')!.valueChanges.subscribe(() => {
      this.updateEndDateAndDayList();
    });
  }
  get rows(): FormArray {
    return this.multidayForm.get('rows') as FormArray;
  }
  updateEndDateAndDayList(): void {
    const startDate = new Date(this.multidayForm.get('startDate')!.value);
    const days = this.multidayForm.get('days')!.value;

    if (startDate && days) {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (days - 1));
      this.multidayForm.patchValue({ endDate: endDate.toISOString().substring(0, 10) });

      // Generate day list with name and star for each day
      this.dayList = [];
      let currentDate = new Date(startDate);
      const end = new Date(endDate);
      while (currentDate <= end) {
        const dateString = currentDate.toISOString().substring(0, 10);
        this.dayList.push({ name: this.name, star: this.star, date: dateString });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Update devoteesList with initial values
      this.updateDevoteesList();
    } else {
      this.dayList = [];
    }
  }

  updateDevoteesList(): void {
    const rowsArray = this.multidayForm.get('rows') as FormArray;
    this.devoteesList = [];

    rowsArray.controls.forEach((control, index) => {
      const name = control.get('name')!.value;
      const star = control.get('star')!.value;
      const dates = this.dayList.map(day => day.date);
      this.devoteesList.push({ name: name, star: star, date: dates });
    });
  }

  addRow(): void {
    const rowsArray = this.multidayForm.get('rows') as FormArray;
    rowsArray.push(this.createRow());
    this.updateDevoteesList(); // Update devotees list when adding a row
  }

  createRow(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      star: ['', Validators.required]
    });
  }

  deleteRow(index: number): void {
    const rowsArray = this.multidayForm.get('rows') as FormArray;
    rowsArray.removeAt(index);
    this.updateDevoteesList(); // Update devotees list when deleting a row
  }

  addDevotee(): void {
    this.addRow(); // Add a new row
  }

  proceed(): void {
    if (this.multidayForm.valid) {
      const formData = { ...this.multidayForm.value };
      console.log(formData)
      this.multidayService.setMultidayData(formData);
      // this.dialogRef.close(true); // Close the dialog with success

      const combinedArray = [];
    for (let i = 0; i < this.dayList.length; i++) {
      const dayInfo = this.dayList[i];
      const devoteeInfo = this.devoteesList[i];
      combinedArray.push({ ...dayInfo, ...devoteeInfo });
    }
    const result = {
      combinedData: combinedArray,
      formData: this.multidayForm.value
    };
    this.dialogRef.close(result);
    // Log the combined array to the console
    console.log("Combined List:", combinedArray);
    } else {
      console.log("Form is invalid");
    }
  }

  closeDialog(): void {
    this.dialogRef.close(); // Close the dialog without success
  }
}

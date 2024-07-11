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
  private readonly masterservice = inject(MasterService);
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      Vazhipad: [''],
      Rate: [''],
      Qty: ['1'],
      Star:[''],
      NoOfDays: ['1'],
      StartDate: [''],
      EndDate: [''],
    });
  }

  ngOnInit() {
    this.getAllvazhipad();
    this.setupAutocomplete();
    this.getNakshthram();
    
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
    return this.nakshatham.filter(
      (option) =>
        option.name.toLowerCase().includes(filterValue) 
    );
  }
  getNakshthram() {
    this.masterservice.getNakshthra().subscribe((res) => {
      this.nakshatham = res;
      console.log(this.nakshatham)
      this.autoCompleteForStar()
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
  autoCompleteForStar(){
    this.starData = this.form.get('Star')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterStar(value || ''))
    );
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

        // if (isVMBooking==='Y') {

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
}

import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DayMaster, VMList } from '../../../models/day-master.model';
import { MasterService } from '../../../services/master/master.service';
import { Observable, map, startWith } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-day-master',
  standalone: true,
  imports: [HeaderComponent, SpinnerComponent, MatAutocompleteModule, CommonModule, ReactiveFormsModule, MatIconModule, MatInputModule, MatCheckboxModule, FormsModule],
  templateUrl: './day-master.component.html',
  styleUrl: './day-master.component.css'
})
export class DayMasterComponent implements OnInit {

  dayMasterForm: FormGroup;
  dayMasterList: DayMaster[] = [];
  showNoRecordsMessage: boolean = false;
  filteredDayMaster: DayMaster[] = [];
  Id: number;
  loading: boolean = false;
  updateFlag: boolean = false;
  searchQuery: string = '';
  allSelected: boolean = false;
  days = [

    {
      "id": 1,
      "name": "Monday"
    },
    {
      "id": 2,
      "name": "Tuesday"
    },
    {
      "id": 3,
      "name": "Wednesday"
    },
    {
      "id": 4,
      "name": "Thursday"
    },
    {
      "id": 5,
      "name": "Friday"
    },
    {
      "id": 6,
      "name": "Satursday"
    },
    {
      "id": 7,
      "name": "Sunday"
    }

  ];
  // myControl = new FormControl('');
  VMList: VMList[] = [];
  filteredVMList: Observable<VMList[]>;
  vazhipadMap: { [key: number]: string } = {};
  dayMap: { [key: number]: string } = {};
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private notification = inject(NotificationService);
  constructor() {
    this.dayMasterForm = this.formBuilder.group({
      VM_Name: ['', [Validators.required]],
      day: this.formBuilder.array([], [Validators.required]),

    });
  }

  ngOnInit() {
    this.loading = true;
    this.getDayMster()
    this.getAllVazhipadName();
    this.getDayMap();
    this.filteredVMList = this.dayMasterForm.get('VM_Name')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVazhipad(value || '')),
    );
  }

  // auto complete vazhipad name filtering
  private _filterVazhipad(value: string) {
    const vazhipad = value.toLowerCase();
    return this.VMList.filter(option => option.VM_Name.toLowerCase().includes(vazhipad));
  }

  //  get day master
  getDayMster() {
    this.loading = true;
    this.masterService.getDayMaster().subscribe({
      next: (res) => {
        console.log(res);
        this.dayMasterList = res;
        this.loading = false
      }
    })
  }

  // get day map
  getDayMap() {
    this.days.forEach(day => {
      this.dayMap[day.id] = day.name;
    });
  }

  // get all vazhipad list
  getAllVazhipadName() {
    this.loading = true;
    this.masterService.getVmaster().subscribe({
      next: (data) => {
        console.log(data);
        this.VMList = data.map(item => ({ VM_Id: item.VM_Id, VM_Name: item.VM_Name ,VM_Code:item.VM_Code}));
        this.VMList.forEach(item => {
          this.vazhipadMap[item.VM_Id] = item.VM_Name;
          this.loading = false;
          console.log(this.VMList)
        });
      }
    })
  }

  onDelete(id: number) {
    this.loading = true
    this.masterService.deleteDay(id).subscribe({
      next: (res) => {
        if (res) {
          this.notification.showSuccess("Day master deleted successfully");
          this.loading = false;
          this.getDayMster();
        }
        else {
          this.notification.showError("An error occured try gain");
          this.loading = false
        }
      },
      error: (err) => {
        this.notification.showError("server down please try after some time");
        this.loading = false
      }
    })
  }

  onChange(e: any) {
    console.log(e.target.value, e.target.checked)
    const checkedValue = e.target.value;
    const checked = e.target.checked;
    const checkedArray = this.dayMasterForm.get('day') as FormArray;
    if (checked) {
      checkedArray.push(new FormControl(checkedValue))
    } else {
      let i: number = 0;
      checkedArray.controls.forEach((item) => {
        if (item.value == checkedValue) {
          checkedArray.removeAt(i);
        }
        i++;
      })
    }
  }

  onSubmit() {
    // console.log(this.dayMasterForm.value);
    const formValue = this.dayMasterForm.value;
    console.log(formValue);
    // console.log(this.VMList);
    const selectedVc = this.VMList.find(vc => vc.VM_Name === formValue.VM_Name);
    console.log(selectedVc)
    if (selectedVc) {

      const VMId = selectedVc.VM_Id;
      console.log(VMId)
      const selectedDays = formValue.day.map((dayIndex: string) => (Number(dayIndex) + 1).toString()); // Convert day index to string
      // 
      // const selectedDays = formValue.day.map((dayIndex: any) => dayIndex.toString());    
      const payLoad = {
        "VazhId": VMId.toString(),
        "Day": selectedDays,
        "Cuser": "2",
        "Type": "INSERT"
      }
      console.log(payLoad)
      // const VMId = selectedVc.VM_Id;
      this.masterService.createDayMaster(payLoad).subscribe({
        next: (res) => {

        }
      })
    }

  }
  toggle() {
    this.allSelected = !this.allSelected;
  }

}

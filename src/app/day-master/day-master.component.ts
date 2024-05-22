import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ThemePalette } from '@angular/material/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DayMaster } from '../models/day-master.model';
import { MasterService } from '../services/master/master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}
@Component({
  selector: 'app-day-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,CommonModule,ReactiveFormsModule, MatIconModule,MatInputModule,MatCheckboxModule,FormsModule],
  templateUrl: './day-master.component.html',
  styleUrl: './day-master.component.css'
})
export class DayMasterComponent {

dayMasterForm:FormGroup;
dayMaster:DayMaster[]=[];
showNoRecordsMessage:boolean=false;
filteredDayMaster: DayMaster[] = [];
Id: number ;
loading:boolean=false;
updateFlag:boolean=false;
searchQuery:string='';
allSelected: boolean = false;

days=["sunday","monday","wednesday","thursday","friday","satursday"];

private masterService = inject(MasterService);
private formBuilder = inject(FormBuilder);
private _snackBar = inject(MatSnackBar);


ngOnInit() {
  this.dayMasterForm = this.formBuilder.group({
    offeringCode: [''],
    checkboxes: this.formBuilder.array([],[Validators.required]),
    
  });

 
}



// for select the check box
onChange(e:any){
  const checkedValue=e.target.value;
  const checked=e.target.checked;
  const checkedArray=this.dayMasterForm.get('checkboxes') as FormArray
  console.log(e.target.value,e.target.checked);
if(checked){
checkedArray.push(new FormControl(checkedValue))
}
else{
  let i:number=0;
  checkedArray.controls.forEach((item)=>{
    if(item.value==checkedValue){
checkedArray.removeAt(i);
    }
    i++;
  })

}
}


 // submitt pmasterform
 onSubmit(data: DayMaster) {
  
  this.loading=true;
  if (this.dayMasterForm.valid) {
    this.masterService.createDayMaster(data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading=false;
        this.openSnackBar(" day master Details created sussess fully", "close", "success-snackbar");

        this.onReset();
      },
      error: (error) => {
        this.loading=true;
        console.log(error);
      }
    })
  }
  else {
    this.markFormGroupTouched(this.dayMasterForm);
  }
}

// resetting form controls
onReset() {
  this.loading=true;
  this.dayMasterForm.reset();
  this.updateFlag = false;
  this.loading=false;

}

//for editing the form fields
onEdit(data: DayMaster) {
  this.loading=true;
  console.log(data);
  this.updateFlag = true;
  this.Id = data.id;
  this.dayMasterForm.patchValue({
    offeringCode: data.Vm_Name,
    checkboxes: data.Days
  });
  this.loading=false;
}


//update data
onUpdate(updatedata: DayMaster) {
  this.loading=true;
  if(this.dayMasterForm.valid){
    console.log(updatedata, this.Id);
    this.masterService.updateDay(this.Id, updatedata).subscribe((res) => {
      this.loading=false;
      this.openSnackBar(" Prathishta Details updated sussess fully", "close", "success-snackbar");
      console.log(res)
    })
  }
  else{
    this.markFormGroupTouched(this.dayMasterForm)
  }
 
 
}



// deleteData
onDelete(id: number) {
  this.loading=true;
  this.masterService.deleteDay(id).subscribe((res) => {
    console.log(res);
    this.loading=false;
    this.openSnackBar(" day master Details deleted sussess fully", "close", "success-snackbar");
  })
}


// search functionality by name and code
onSearch(searchQuery: string) {
  
  if (!this.searchQuery.trim()) {
    this.filteredDayMaster = this.dayMaster;
  }

  else {
    this.filteredDayMaster = this.dayMaster.filter((data) => {
      console.log(data)
      return data.Vm_Name.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
    
  }
  this.showNoRecordsMessage=this.filteredDayMaster.length===0
}

// snack  message
openSnackBar(message: string, action: string, classname: string) {
  this._snackBar.open(message, action, {
    panelClass: classname,
    horizontalPosition: "end",
    verticalPosition: "top",
  });
}


// validation
markFormGroupTouched(formGroup: FormGroup) {
  Object.values(formGroup.controls).forEach(control => {
    control.markAsTouched();

    if (control instanceof FormGroup) {
      this.markFormGroupTouched(control);
    }
  });
}


}

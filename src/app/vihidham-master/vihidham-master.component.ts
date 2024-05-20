import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { VihidhamMaster } from '../models/vihidham-master.model';
import { MasterService } from '../services/master/master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DuplicatecheckService } from '../services/duplicateCheckValidator/duplicatecheck.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vihidham-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,CommonModule,MatIconModule,MatButtonModule,MatInputModule,ReactiveFormsModule],
  templateUrl: './vihidham-master.component.html',
  styleUrl: './vihidham-master.component.css'
})
export class VihidhamMasterComponent {
  vihidhamMasterForm:FormGroup;
  vihidhamMaster: VihidhamMaster[] = [];
  filteredVihidhamMaster: VihidhamMaster[] = [];
  showNoRecordsMessage: boolean = false;
  updateFlag: boolean = false;
  searchQuery: string = '';
  loading:boolean=false;
Id:string;
private masterService = inject(MasterService);
private formBuilder = inject(FormBuilder);
private _snackBar = inject(MatSnackBar);
private duplicateCheck=inject(DuplicatecheckService);

constructor(){
  this.vihidhamMasterForm=this.formBuilder.group({
    vihidham_code:['',Validators.required],
    vihidham_name:['',Validators.required],
    account_head:['',Validators.required],
    account_subHead:['',Validators.required],
    type:['',Validators.required],
    pvItem:[false]

  })
}

ngOnInit(): void {
  this.loading=true;
  this.getVihidhamMaster();

}

// view prathishta
getVihidhamMaster() {
  this.loading=false;
  this.masterService.getVihidhamMaster().subscribe({
    next: (data) => {
      if (data && data.length > 0) {
        // console.log(data)
        this.vihidhamMaster = data;
        this.filteredVihidhamMaster = this.vihidhamMaster;
        this.loading=false;
      }
    },
    error: (error) => {
      console.log(error);
      this.loading=true;
    }
  });
}

// get pmaster form controls
get vihidhamMasterControl() {
  return this.vihidhamMasterForm.controls;
}

// submitt pmasterform
onSubmit(data: VihidhamMaster) {
  console.log(data);
  this.loading=true;
  if (this.vihidhamMasterForm.valid) {
    this.masterService.createVihidhamMaster(data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading=false;
        this.openSnackBar(" vihidham Details created sussess fully", "close", "success-snackbar");

        this.onReset();
      },
      error: (error) => {
        this.loading=true;
        console.log(error);
      }
    })
  }
  else {
    this.markFormGroupTouched(this.vihidhamMasterForm);
  }
}

// resetting form controls
onReset() {
  this.loading=true;
  this.vihidhamMasterForm.reset();
  this.updateFlag = false;
  this.loading=false;

}

//for editing the form fields
onEdit(data: VihidhamMaster) {
  this.loading=true;
  console.log(data);
  this.updateFlag = true;
  this.Id = data.VH_id;
  this.vihidhamMasterForm.patchValue({
    vihidham_code:data.vihidham_code,
    vihidham_name:data.vihidham_name,
    account_head:data.account_head,
    account_subHead:data.account_subHead,
    type:data.type,
    pvItem:data.pvItem
  });
  this.loading=false;
}


//update data
onUpdate(updatedata: VihidhamMaster) {
  this.loading=true;
  if(this.vihidhamMasterForm.valid){
    console.log(updatedata, this.Id);
    this.masterService.updateVihidhamMaster(this.Id, updatedata).subscribe((res) => {
      this.loading=false;
      this.openSnackBar(" Prathishta Details updated sussess fully", "close", "success-snackbar");
      console.log(res)
    })
  }
  else{
    this.markFormGroupTouched(this.vihidhamMasterForm)
  }
 
 
}


// deleteData
onDelete(id: string) {
  this.loading=true;
  this.masterService.deleteVihidhamMaster(id).subscribe((res) => {
    console.log(res);
    this.loading=false;
    this.openSnackBar(" vihidham Details deleted sussess fully", "close", "success-snackbar");
  })
}


// search functionality by name and code
onSearch(searchQuery: string) {
  
  if (!this.searchQuery.trim()) {
    this.filteredVihidhamMaster = this.vihidhamMaster;
  }

  else {
    this.filteredVihidhamMaster = this.vihidhamMaster.filter((data) => {
      console.log(data)
      return data.vihidham_name.toLowerCase().includes(this.searchQuery.toLowerCase()) || data.vihidham_code.toLowerCase().includes(this.searchQuery.toLowerCase())
    });
    
  }
  this.showNoRecordsMessage=this.filteredVihidhamMaster.length===0
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

// duplicate code check validators
duplicateCodeValidator(control: AbstractControl): ValidationErrors | null {
  const code = control.value;
  if (this.duplicateCheck.vihidhamMastercheckDuplicateCode(code,this.vihidhamMaster)) {
    return { duplicateCode: true };
  }
  return null;
}
 
// duplicate name check validators
duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
  const name = control.value;
  if (this.duplicateCheck.vihidhamMastercheckDuplicateName(name, this.vihidhamMaster)) {
    return { duplicateName: true };
  }
  return null;
}
}

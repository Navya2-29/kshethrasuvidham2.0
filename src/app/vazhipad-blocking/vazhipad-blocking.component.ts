import { Component, Inject, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../services/master/master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { VazhipadBlocking } from '../models/vazhipadBlockingMaster.model';
import { BlockParameter } from '@angular/compiler';
@Component({
  selector: 'app-vazhipad-blocking',
  standalone: true,
  imports: [HeaderComponent, SpinnerComponent, MatIconModule, FormsModule, MatButtonModule, MatAutocompleteModule, AsyncPipe, CommonModule, ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './vazhipad-blocking.component.html',
  styleUrl: './vazhipad-blocking.component.css'
})
export class VazhipadBlockingComponent {
  searchQuery:string='';
  BlockingMater:VazhipadBlocking[]=[];
  filteredBlockingMater:VazhipadBlocking[]=[];
  vazhipadBlockingForm: FormGroup;
  blockingCategory: boolean = false;
  VB_category: string = 'Yearly';
  nakshatham: string[] = [];
  showNoRecordsMessage: boolean = false;
  filteredOptions: Observable<string[]>;
  blockingFlag: boolean = false;
  loading:boolean=false;
  today: Date = new Date();
  updateFlag:boolean=false;
  Id:string;
  private formBuilder = inject(FormBuilder);
  private masterService = inject(MasterService);
  private _snackBar=inject(MatSnackBar);
  constructor() {

    // form model
    this.vazhipadBlockingForm = this.formBuilder.group({
      VM_code: ['', [Validators.required]],
      VB_name: ['', [Validators.required]],
      VB_FromDate: [this.today.toISOString().substring(0, 10),[Validators.required]],
      VB_ToDate: ['',[Validators.required]],
      VB_Reason: ['', [Validators.required]],
      Nakshathra: [''],
      VB_radio: ['', [Validators.required]]
    })
  }

  ngOnInit() {
    // filtering stars
    this.filteredOptions = this.vazhipadBlockingForm.get('Nakshathra')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    this.getNakshthram();

// get rhe radio button blocking values
    this.vazhipadBlockingForm.get('VB_radio')!.valueChanges.subscribe(value => {
      this.getCategory(value);
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.nakshatham.filter(option => option.toLowerCase().includes(filterValue));
  }

  // get nakshthram
  getNakshthram() {
    this.masterService.getNakshthra().subscribe((res) => {
      console.log(res);
      this.nakshatham = res;
    })
  }
  // get Categary
  getCategory(category: string) {
    console.log(category);
    if (category == 'Yearly') {
      this.VB_category = category;
      this.blockingFlag = false;
    }
    else if (category == 'Monthly') {
      this.VB_category = category;
      this.blockingFlag = false;
    }
    else {
      this.VB_category = category;
      this.blockingFlag = true
    }

  }
   // get vazhipadBlocking form controls
   get vazhipadBlockingControl() {
    return this.vazhipadBlockingForm.controls;
  }
// search functionality by pname
onSearch(searchQuery: string) {
  if (!this.searchQuery.trim()) {
    this.filteredBlockingMater = this.BlockingMater;
  }

  else {
    this.filteredBlockingMater = this.BlockingMater.filter((data) => {
      console.log(data)
      return data.VM_Name.toLowerCase().includes(this.searchQuery) || data.VM_code.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
  }
  this.showNoRecordsMessage=this.filteredBlockingMater.length===0

}

// view blocking vazhipad
getVazhipadBlockingMaster() {
  this.loading=false;
  this.masterService.getBlockingMaster().subscribe({
    next: (data) => {
      if (data && data.length > 0) {
        // console.log(data)
        this.BlockingMater = data;
        this.filteredBlockingMater = this.BlockingMater;
        this.loading=false;
      }
    },
    error: (error) => {
      console.log(error);
      this.loading=true;
    }
  });
}




// submit data
onSubmit(data: VazhipadBlocking) {
  
  this.loading=true;
  if (this.vazhipadBlockingForm.valid) {
    this.masterService.createBlockingMaster(data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading=false;
        this.openSnackBar(" vazhipad blocking Details created sussess fully", "close", "success-snackbar");

        this.onReset();
      },
      error: (error) => {
        this.loading=true;
        console.log(error);
      }
    })
  }
  else {
    this.markFormGroupTouched(this.vazhipadBlockingForm);
  }
 
}

// resetting form controls
onReset() {
  this.loading=true;
  this.vazhipadBlockingForm.reset();
  this.updateFlag = false;
  this.loading=false;

}

//for editing the form fields
onEdit(data: VazhipadBlocking) {
  this.loading=true;
  console.log(data);
  this.updateFlag = true;
  this.Id = data.vbId;
  this.vazhipadBlockingForm.patchValue({
    VM_code: data.VM_code,
      VB_name: data.VM_Name,
      VB_FromDate: data.vbFromDate,
      VB_ToDate: data.vbToDate,
      VB_Reason:data.vbReason,
      Nakshathra: data.vbNakshthra,
      
  });
  this.loading=false;
}


  //update data
  onUpdate(updatedata: BlockParameter) {
    this.loading=true;
    console.log(updatedata, this.Id);
    this.masterService.updateBlockingMaster(this.Id, updatedata).subscribe((res) => {
      this.loading=false;
      this.openSnackBar(" Prathishta Details updated sussess fully", "close", "success-snackbar");
      console.log(res)
    })
  }


  // deleteData
  onDelete(id: string) {
    this.loading=true;
    this.masterService.deleteBlockingMaster(id).subscribe((res) => {
      console.log(res);
      this.loading=false;
      this.openSnackBar(" blocking Details deleted sussess fully", "close", "success-snackbar");
    })
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

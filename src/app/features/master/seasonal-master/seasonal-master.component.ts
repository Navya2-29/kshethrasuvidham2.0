import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MasterService } from '../../../services/master/master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SeasonalMaster } from '../../../models/season-master.model';

@Component({
  selector: 'app-seasonal-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,MatInputModule,CommonModule,AsyncPipe,MatIconModule,MatButtonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './seasonal-master.component.html',
  styleUrl: './seasonal-master.component.css'
})
export class SeasonalMasterComponent implements OnInit {
seasonalBlockingForm:FormGroup;
seasonalMaster:SeasonalMaster[]=[];
filteredSeasonalMaster: SeasonalMaster[] = [];
showNoRecordsMessage: boolean = false;
updateFlag: boolean = false;
searchQuery: string = '';
loading:boolean=false;
Id:string;
private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
constructor(){
  this.seasonalBlockingForm=this.formBuilder.group({
    VS_code:['',[Validators.required]],
    VM_name:['',[Validators.required]],
    VS_fromDate:[new Date(),[Validators.required]],
    VS_toDate:[new Date(),[Validators.required]],
  })
}
  ngOnInit(): void {
    this.loading=true;
    this.getSeasonalMaster();

  }

  // get form controls
  get SeasonalFormControl(){
    return this.seasonalBlockingForm.controls;

  }

  // get seasonal master data

  getSeasonalMaster(){
    this.loading=false;
    this.masterService.getSeasonalMaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // console.log(data)
          this.seasonalMaster = data;
          this.filteredSeasonalMaster = this.seasonalMaster;
          this.loading=false;
        }
      },
      error: (error) => {
        console.log(error);
        this.loading=true;
      }
    });
  }

  onSubmit(data: SeasonalMaster) {
   console.log(data);
    this.loading=true;
    if (this.seasonalBlockingForm.valid) {
      this.masterService.createSeasonalMaster(data).subscribe({
        next: (res) => {
          console.log(res);
          this.loading=false;
          this.openSnackBar(" seasonal Details created sussess fully", "close", "success-snackbar");

          this.onReset();
        },
        error: (error) => {
          this.loading=true;
          console.log(error);
        }
      })
    }
    else {
      this.markFormGroupTouched(this.seasonalBlockingForm);
    }
  }

  // resetting form controls
  onReset() {
    this.loading=true;
    this.seasonalBlockingForm.reset();
    this.updateFlag = false;
    this.loading=false;

  }

  //for editing the form fields
  onEdit(data: SeasonalMaster) {
    this.loading=true;
    console.log(data);
    this.updateFlag = true;
    this.Id = data.VS_id;
    this.seasonalBlockingForm.patchValue({
      VS_code:data.VS_code,
      VM_name:data.VM_name,
      VS_fromDate:data.VS_fromDate,
      VS_toDate:data.VS_toDate,
    });
    this.loading=false;
  }


  //update data
  onUpdate(updatedata: SeasonalMaster) {
    this.loading=true;
    if(this.seasonalBlockingForm.valid){
      console.log(updatedata, this.Id);
      this.masterService.updateSeasonalMaster(this.Id, updatedata).subscribe((res) => {
        this.loading=false;
        this.openSnackBar(" seasonal Details updated sussess fully", "close", "success-snackbar");
        console.log(res)
      })
    }
    else{
      this.markFormGroupTouched(this.seasonalBlockingForm)
    }
   
   
  }


  // deleteData
  onDelete(id: string) {
    this.loading=true;
    this.masterService.deleteSeasonalMaster(id).subscribe((res) => {
      console.log(res);
      this.loading=false;
      this.openSnackBar(" seasonal Details deleted sussess fully", "close", "success-snackbar");
    })
  }


  // search functionality by name and code
  onSearch(searchQuery: string) {
    
    if (!this.searchQuery.trim()) {
      this.filteredSeasonalMaster = this.seasonalMaster;
    }

    else {
      this.filteredSeasonalMaster = this.seasonalMaster.filter((data) => {
        console.log(data)
        return data.VM_name.toLowerCase().includes(this.searchQuery.toLowerCase()) || data.VS_code.toLowerCase().includes(this.searchQuery.toLowerCase())
      });
      
    }
    this.showNoRecordsMessage=this.filteredSeasonalMaster.length===0
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

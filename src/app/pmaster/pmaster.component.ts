import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm, ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Pmaster } from '../models/pmaster.model';
import { MasterService } from '../services/master/master.service';
import { CommonModule } from '@angular/common';
import { UpperCaseDirective } from '../shared/directives/upper-case.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DuplicatecheckService } from '../services/duplicateCheckValidator/duplicatecheck.service';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
@Component({
  selector: 'app-pmaster',
  standalone: true,
  imports: [HeaderComponent,
    MatIconModule,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    UpperCaseDirective,
    MatTableModule,
    SpinnerComponent,
    MatCheckboxModule
  ],
  templateUrl: './pmaster.component.html',
  styleUrl: './pmaster.component.css',

})
export class PmasterComponent implements OnInit {
  pmaster: Pmaster[] = [];
  filteredPmaster: Pmaster[] = [];
  showNoRecordsMessage: boolean = false;
  pmasterForm: FormGroup;
  updateFlag: boolean = false;
  searchQuery: string = '';
  selectedFile: File;
  fileError: string | null = null;
  @ViewChild('fileInput') fileInput: any;
  imagePreview: string | ArrayBuffer | null = null;
  fileInputMessageFlag: boolean = true;
  loading: boolean = false;
  errorMessage: string = '';
  reqBody: object;
  chckBoxValue:string='Y';
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
  private duplicateCheck = inject(DuplicatecheckService);


  constructor() {
    // form model
    this.pmasterForm = this.formBuilder.group({
      PMCode: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern('^[a-zA-Z0-9]+$'),
        this.duplicateCodeValidator.bind(this)
      ]],
      PMName: ['', [Validators.required,
      Validators.pattern('^[a-zA-Z\s]+$'),
      this.duplicateNameValidator.bind(this),
      Validators.maxLength(100),
      ]],
      PMRName: ['', Validators.required],
      PMImage: ['',],
      PMId: [''],
      Active: [true],
      Type: ['INSERT'],
      UnitId: ["1"],
      Cuser: ['1']
    });
  }
  ngOnInit(): void {
    this.loading = true;
    this.getPmaster();

  }

  // view prathishta
  getPmaster() {
    this.loading = false;
    this.masterService.getPmaster().subscribe({
      next: (data) => {
        console.log(data);
        if (data && data.length > 0) {

          this.pmaster = data;
          this.filteredPmaster = this.pmaster;
          this.loading = false;
          // console.log(this.filteredPmaster + "both")
        }
      },
      error: (error) => {
        console.log(error);
        this.loading = true;
      }
    });
  }

  // get pmaster form controls
  get pmasterFormFormControl() {
    return this.pmasterForm.controls;
  }

  // submitt pmasterform
  onSubmit() {
    console.log(this.pmasterForm.value);
    console.log("data");
    this.loading = true;
    if (this.pmasterForm.valid) {
      const reqBody=this.pmasterForm.value;
      reqBody.Active=reqBody.Active ? 'Y' : 'N';
      console.log(reqBody)
      console.log("req")
      this.masterService.createPmaster(reqBody).subscribe({
        next: (res) => {
          console.log(res + "response");
          if (res) {
            this.loading = false;
            this.openSnackBar(" Prathishta Details created sussess fully", "close", "success-snackbar");

            this.onReset();
            this.ngOnInit();
          }
        },
        error: (error) => {
          this.loading = true;
          console.log(error);
        }
      })
    }
    else {
      this.loading = false;
      this.markFormGroupTouched(this.pmasterForm);
    }
  }

  // resetting form controls
  onReset() {
    this.loading = true;
    this.pmasterForm.reset();
    this.updateFlag = false;
    this.fileInput.nativeElement.value = '';
    this.fileInputMessageFlag = true;
    this.imagePreview = '';
    this.loading = false;

  }

  //for editing the form fields
  onEdit(data: Pmaster) {
    this.loading = true;
    console.log(data);
    this.updateFlag = true;
    this.pmasterForm.patchValue({
      PMCode: data.PM_Code,
      PMName: data.PM_Name,
      PMRName: data.PM_RegName,
      PMImage: data.PM_Image,
      PMId:data.PM_ID,
      Type:'UPDATE',
      Active:this.chckBoxValue,
      UnitId: "1",
      Cuser:"1"
    });
    console.log(this.pmasterForm);
    this.loading = false;
  }
  //update data
  onUpdate(updatedata:any) {
    this.loading = true;
    console.log(updatedata.PM_Active +"bnnnnn");
    if (this.pmasterForm.valid) {
      console.log(updatedata);
      const updateBody={
        PMCode: updatedata.PM_Code,
      PMName: updatedata.PM_Name,
      PMRName: updatedata.PM_RegName,
      PMImage: updatedata.PM_Image,
      PMId:updatedata.PM_ID,
      Type:'UPDATE',
      Active:this.chckBoxValue,
      UnitId: "1",
      Cuser:"1"

      }
      console.log(updateBody);
      console.log("ddddd");
      this.masterService.updatePmaster(updatedata).subscribe((res) => {
        this.loading = false;
        this.openSnackBar(" Prathishta Details updated sussess fully", "close", "success-snackbar");
        this.ngOnInit();
        console.log(res);
        this.onReset();
      })
    }
    else {
      this.markFormGroupTouched(this.pmasterForm)
      this.loading=false;
    }
  }


  // deleteData
  onDelete(Id: string) {
    console.log(Id);
    this.loading = true;
    const deleteReq={
      "Type":"Prethista",
      "Id":Id
    }
    this.masterService.deletePmaster(deleteReq).subscribe((res) => {
      console.log(res);
      this.loading = false;
      this.openSnackBar(" Prathishta Details deleted sussess fully", "close", "success-snackbar");
      this.ngOnInit();
    })
  }


  // search functionality by name and code
  onSearch(searchQuery: string) {

    if (!this.searchQuery.trim()) {
      this.filteredPmaster = this.pmaster;
    }

    else {
      this.filteredPmaster = this.pmaster.filter((data) => {
        console.log(data)
        return data.PM_Name.toLowerCase().includes(this.searchQuery.toLowerCase()) || data.PM_Code.toLowerCase().includes(this.searchQuery.toLowerCase())
      });

    }
    this.showNoRecordsMessage = this.filteredPmaster.length === 0
  }

  // snack  message
  openSnackBar(message: string, action: string, classname: string) {
    this._snackBar.open(message, action, {
      panelClass: classname,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }

  // for previewing uploaded image
  previewImage(event: any) {
    // Validate image dimensions
    const file = event.target.files[0];

    if (file) {
      this.fileInputMessageFlag = false;
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        this.errorMessage = 'File size should not exceed 2MB.';
        this.imagePreview = null;
        this.fileInput.nativeElement.value = '';
        this.fileInputMessageFlag = false;
        return;
      }
      // Validate image dimensions
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        if (img.width > maxWidth || img.height > maxHeight) {
          this.errorMessage = `Image dimensions should not exceed ${maxWidth}x${maxHeight} pixels.`;
          this.imagePreview = null;
        } else {
          this.errorMessage = '';
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagePreview = e.target?.result ?? null;
          };
          reader.readAsDataURL(file);
        }
      };
      img.src = URL.createObjectURL(file);
    } else {
      this.errorMessage = 'No file selected.';
      this.imagePreview = null;
    }
  }


  // cancel uploded image only
  removeImagePreview() {
    this.fileInput.nativeElement.value = '';
    this.fileInputMessageFlag = true;
    this.imagePreview = '';
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
    if(this.updateFlag){
      return null;
    }
    else{
      const code = control.value;
      if (this.duplicateCheck.checkDuplicateCode(code, this.pmaster)) {
        return { duplicateCode: true };
      }
      return null;
    }
  }

  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    if(this.updateFlag){
      return null
    }
    else{
      const name = control.value;
      if (this.duplicateCheck.checkDuplicateName(name, this.pmaster)) {
        return { duplicateName: true };
      }
      return null;
    }
    
  }

// change check box value
onChange(event:any){
console.log(event.checked);
const checked=event.checked;
if(checked){
  this.pmasterForm.patchValue({
    Active:true
  })
  console.log(this.pmasterForm.value)
  console.log("true")
}else{
  this.pmasterForm.patchValue({
    Active:false
  })
  console.log(this.pmasterForm.value)
  console.log("false")
}

}

}




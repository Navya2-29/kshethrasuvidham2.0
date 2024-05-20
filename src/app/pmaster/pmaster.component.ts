import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm, ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Pmaster, CreatePmaster } from '../models/pmaster.model';
import { MasterService } from '../services/master/master.service';
import { CommonModule } from '@angular/common';
import { UpperCaseDirective } from '../shared/directives/upper-case.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DuplicatecheckService } from '../services/duplicateCheckValidator/duplicatecheck.service';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
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
    SpinnerComponent
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
  Id: string = '';
loading:boolean=false;
errorMessage:string='';
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
  private duplicateCheck=inject(DuplicatecheckService);
  

  constructor() {
    // form model
    this.pmasterForm = this.formBuilder.group({
      PM_Code: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern('^[a-zA-Z0-9]+$'),
        this.duplicateCodeValidator.bind(this)
      ]],
      PM_NameEng: ['', [Validators.required,
      Validators.pattern('^[a-zA-Z\s]+$'),
      this.duplicateNameValidator.bind(this),
      Validators.maxLength(100),
      ]],
      PM_Name: ['', Validators.required],
      imgurl: ['',]
    });
  }


  ngOnInit(): void {
    this.loading=true;
    this.getPmaster();

  }

  // view prathishta
  getPmaster() {
    this.loading=false;
    this.masterService.getPmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // console.log(data)
          this.pmaster = data;
          this.filteredPmaster = this.pmaster;
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
  get pmasterFormFormControl() {
    return this.pmasterForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: CreatePmaster) {
    // console.log(data.PM_Code,data.PM_NameEng,this.selectedFile.name);
    //     const formData = new FormData();
    //     formData.append('PM_Code', data.PM_Code);
    //     formData.append('PM_NameEng',data.PM_NameEng);
    //     formData.append('PM_Name',data.PM_Name);
    //     formData.append('imgurl', this.selectedFile.name);
    //      console.log(formData);
    // this.openSnackBar(" Prathishta Details created sussess fully", "close","success-snackbar");

    // const obj = this.pmasterForm.value;
    this.loading=true;
    if (this.pmasterForm.valid) {
      this.masterService.createPmaster(data).subscribe({
        next: (res) => {
          console.log(res);
          this.loading=false;
          this.openSnackBar(" Prathishta Details created sussess fully", "close", "success-snackbar");

          this.onReset();
        },
        error: (error) => {
          this.loading=true;
          console.log(error);
        }
      })
    }
    else {
      this.markFormGroupTouched(this.pmasterForm);
    }
  }

  // resetting form controls
  onReset() {
    this.loading=true;
    this.pmasterForm.reset();
    this.updateFlag = false;
    this.fileInput.nativeElement.value = '';
    this.fileInputMessageFlag = true;
    this.imagePreview = '';
    this.loading=false;

  }

  //for editing the form fields
  onEdit(data: Pmaster) {
    this.loading=true;
    console.log(data);
    this.updateFlag = true;
    this.Id = data.id;
    this.pmasterForm.patchValue({
      PM_Code: data.PM_Code,
      PM_NameEng: data.PM_NameEng,
      PM_Name: data.PM_Name,
      imgurl: data.imgurl
    });
    this.loading=false;
  }


  //update data
  onUpdate(updatedata: Pmaster) {
    this.loading=true;
    if(this.pmasterForm.valid){
      console.log(updatedata, this.Id);
      this.masterService.updatePmaster(this.Id, updatedata).subscribe((res) => {
        this.loading=false;
        this.openSnackBar(" Prathishta Details updated sussess fully", "close", "success-snackbar");
        console.log(res)
      })
    }
    else{
      this.markFormGroupTouched(this.pmasterForm)
    }
   
   
  }


  // deleteData
  onDelete(id: string) {
    this.loading=true;
    this.masterService.delete(id).subscribe((res) => {
      console.log(res);
      this.loading=false;
      this.openSnackBar(" Prathishta Details deleted sussess fully", "close", "success-snackbar");
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
        return data.PM_NameEng.toLowerCase().includes(this.searchQuery.toLowerCase()) || data.id.toLowerCase().includes(this.searchQuery.toLowerCase())
      });
      
    }
    this.showNoRecordsMessage=this.filteredPmaster.length===0
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
        const maxSizeInBytes = 2 * 1024 *1024; // 2MB
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
  removeImagePreview(){
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
    const code = control.value;
    if (this.duplicateCheck.checkDuplicateCode(code,this.pmaster)) {
      return { duplicateCode: true };
    }
    return null;
  }
   
  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (this.duplicateCheck.checkDuplicateName(name, this.pmaster)) {
      return { duplicateName: true };
    }
    return null;
  }
 
  
}




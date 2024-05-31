import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Pmaster } from '../../../models/pmaster.model';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
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
  @ViewChild('tableToExport', { static: false }) tableElement: ElementRef;
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
  Id: string = '';
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
  private duplicateCheck = inject(DuplicatecheckService);

  constructor(private toastr: ToastrService) {
    this.loading = true;
    // form model
    this.pmasterForm = this.formBuilder.group({
      PM_Code: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern('^[a-zA-Z0-9]+$'),
        this.duplicateCodeValidator.bind(this),
      ]],
      PM_Name: ['', [Validators.required,
      Validators.pattern('[a-zA-Z\\s]*'),

      Validators.maxLength(100),
      ]],
      PM_RegName: ['', Validators.required],
      PM_Image: [''],
      PM_Active: [true],

    });
  }


  ngOnInit(): void {
    this.loading = true;
    this.getPmaster();

  }

  // view prathishta
  getPmaster() {
    this.loading = true;
    this.masterService.getPmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.pmaster = data;
          this.filteredPmaster = this.pmaster;
          this.loading = false;
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
    this.loading = true;
    console.log(this.pmasterForm.value)
    if (this.pmasterForm.valid) {
      this.masterService.createPmaster(this.pmasterForm.value).subscribe({
        next: (res) => {
          if (res) {

            this.openSnackBar(" Prathishta Details created sussess fully", "close", "success-snackbar");
            this.onReset();
            this.ngOnInit();
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = true;
          // console.log(error);
        }
      })
    }
    else {
      this.loading = false;
      this.markFormGroupTouched(this.pmasterForm);
      this.openSnackBar(" please fill the  details", "close", "success-snackbar");

    }
  }


  // resetting form controls
  onReset() {
    this.loading = true;
    this.pmasterForm.reset({
      PM_Active: true,
      PM_Image: ""
    });
    this.updateFlag = false;
    this.fileInput.nativeElement.value = '';
    this.fileInputMessageFlag = true;
    this.imagePreview = '';
    this.loading = false;

  }

  //for editing the form fields
  onEdit(data: Pmaster) {
    this.loading = true;
    this.updateFlag = true;
    this.Id = data.PM_ID;
    this.pmasterForm.patchValue({
      PM_Code: data.PM_Code,
      PM_Name: data.PM_Name,
      PM_RegName: data.PM_RegName,
      PM_Image: data.PM_Image,
      PM_Active: data.PM_Active == "Y" ? true : false,
    });
    console.log(this.pmasterForm);
    if (data.PM_Image) {
      this.imagePreview = data.PM_Image
    }
    this.loading = false;
  }

  //update data
  onUpdate(updatedata: Pmaster) {
    this.loading = true;
    if (this.pmasterForm.valid) {
      this.masterService.updatePmaster(updatedata, this.Id).subscribe((res) => {
        this.loading = false;
        this.openSnackBar(" Prathishta Details updated sussess fully", "close", "success-snackbar");
        this.ngOnInit();
        this.onReset();
      })
    }

    else {
      this.markFormGroupTouched(this.pmasterForm)
      this.loading = false;
      this.openSnackBar(" please fill the  details", "close", "success-snackbar");

    }
  }

  // delete Data
  onDelete(Id: string) {
    this.loading = true;
    this.masterService.deletePmaster(Id).subscribe((res) => {
      this.loading = false;
      this.openSnackBar(" Prathishta Details deleted sussess fully", "close", "success-snackbar");
      this.ngOnInit();
    })
  }


  // search functionality by name and code
  onSearch() {

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
      duration: 2000
    });
  }

  //  preview  the image
  previewImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileInputMessageFlag = false;

      // Check if the file type is PNG
      if (file.type !== 'image/png') {
        this.errorMessage = 'Only PNG images are allowed.';
        this.imagePreview = null;
        this.fileInput.nativeElement.value = '';
        this.fileInputMessageFlag = true;
        return;
      }

      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        this.errorMessage = 'File size should not exceed 2MB.';
        this.imagePreview = null;
        this.fileInput.nativeElement.value = '';
        this.fileInputMessageFlag = true;
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        if (img.width > maxWidth || img.height > maxHeight) {
          this.errorMessage = `Image dimensions should not exceed ${maxWidth}x${maxHeight} pixels.`;
          this.imagePreview = null;
          this.fileInput.nativeElement.value = '';
          this.fileInputMessageFlag = true;
        } else {
          this.errorMessage = '';
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            console.log(base64Image);
            this.imagePreview = base64Image;
            this.pmasterForm.patchValue({ PM_Image: base64Image });

          };
          reader.readAsDataURL(file);
        }
        URL.revokeObjectURL(img.src); // Clean up the object URL
      };

      img.src = URL.createObjectURL(file);
    } else {
      this.errorMessage = 'No file selected.';
      this.imagePreview = null;
      this.fileInputMessageFlag = true;
    }
  }

  // cancel uploded image only
  removeImagePreview() {
    this.fileInput.nativeElement.value = '';
    this.fileInputMessageFlag = true;
    this.imagePreview = '';
    this.errorMessage = '';
    this.pmasterForm.patchValue({ PM_Image: " " });
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
    if (this.updateFlag) {
      return null
    } else {
      if (this.duplicateCheck.checkDuplicateCode(code, this.pmaster)) {
        return { duplicateCode: true };
      }
      return null;
    }
  }

  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (this.duplicateCheck.checkDuplicateName(name, this.pmaster)) {
      return { duplicateName: true };
    }
    return null;
  }
  showSuccess() {
    this.toastr.success('Hello world!', 'Toastr fun!');
  }

  

}




import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, NgForm, ReactiveFormsModule, FormBuilder, Validators, FormGroup, ValidationErrors, AbstractControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Cmaster, VCMRequestBody } from '../../../models/cmaster.model';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
@Component({
  selector: 'app-cmaster',
  standalone: true,
  imports: [HeaderComponent, MatIconModule, RouterModule, FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    UpperCaseDirective,
    MatTableModule, MatSlideToggleModule, MatCheckboxModule

  ],
  templateUrl: './cmaster.component.html',
  styleUrl: './cmaster.component.css'
})
export class CmasterComponent implements OnInit {
  cmaster: Cmaster[] = [];
  filteredCmaster: Cmaster[] = [];
  showNoRecordsMessage: boolean = false;
  cmasterForm: FormGroup;
  updateFlag: boolean = false;
  searchQuery: string = '';
  Id: string = '';
  showMaxLengthError: boolean = false;
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
  private duplicateCheck = inject(DuplicatecheckService)
  constructor() {

    this.cmasterForm = this.formBuilder.group({
      VC_Code: ['', [
        Validators.required,
        Validators.maxLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$'),
        this.duplicateCodeValidator.bind(this),

      ]],
      VC_Name: ['', [Validators.required,
      Validators.pattern('[a-zA-Z\\s]*'),
      this.duplicateNameValidator.bind(this),

      ]],
      VC_RegName: ['', [Validators.required]],
      VC_Active: [true, [Validators.requiredTrue]]
    });
  }
  ngOnInit(): void {
    this.getcmaster();
  }
  // view prathishta
  getcmaster() {
    const reqBody: VCMRequestBody = { "Type": "CategoryALL", "Code": "" }
    this.masterService.getCmaster(reqBody).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          console.log(data)
          this.cmaster = data;
          this.filteredCmaster = this.cmaster
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // get pmaster form controls
  get cmasterFormControl() {
    return this.cmasterForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: Cmaster) {
    if (this.cmasterForm.valid) {
      this.masterService.createCmaster(data).subscribe({
        next: (res) => {

          this.openSnackBar(" categoery Details created sussess fully", "close", "success-snackbar");
          console.log(res);
          this.onReset();
          this.ngOnInit();
        },
        error: (error) => {
          console.log(error);
        }
      })
    } else {
      this.markFormGroupTouched(this.cmasterForm);
      this.openSnackBar(" please fill the  details", "close", "success-snackbar");
    }

  }



  // resetting form controls
  onReset() {
    this.cmasterForm.reset();
    this.updateFlag = false;

  }

  //for editing the form fields
  onEdit(data: Cmaster) {
    console.log(data);
    this.Id = data.VC_ID;
    this.updateFlag = true;
    this.cmasterForm.patchValue({
      VC_Code: data.VC_Code,
      VC_Name: data.VC_Name,
      VC_RegName: data.VC_RegName,
      VC_Active: data.VC_Active

    });
  }

  //update data
  onUpdate(updatedata: Cmaster) {
    console.log(updatedata);
    if (this.cmasterForm.valid) {
      this.masterService.updateCmaster(this.Id, updatedata).subscribe((res) => {
        this.openSnackBar(" category Details updated sussess fully", "close", "success-snackbar");
        console.log(res);
        this.onReset();
        this.ngOnInit();
      })
    }
    else {
      this.markFormGroupTouched(this.cmasterForm);
      this.openSnackBar(" please fill the  details", "close", "success-snackbar");
    }
  }
  // deleteData
  onDelete(id: string) {
    console.log(typeof (id));
    this.masterService.deleteCmaster(id).subscribe((res) => {
      this.openSnackBar(" category Details deleted sussess fully", "close", "success-snackbar");
      this.ngOnInit();
      console.log(res);
    })
  }

  // search functionality by pname
  onSearch(searchQuery: string) {
    if (!this.searchQuery.trim()) {
      this.filteredCmaster = this.cmaster;
    }
    else {
      this.filteredCmaster = this.cmaster.filter((data) => {
        console.log(data)
        return data.VC_Name.toLowerCase().includes(this.searchQuery) || data.VC_Code.toLowerCase().includes(this.searchQuery.toLowerCase())
      });
    }
  }
  // snack  message
  openSnackBar(message: string, action: string, classname: string) {
    this._snackBar.open(message, action, {
      panelClass: classname,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }

  onInputChange(event: any) {
    const inputValue: string = event.target.value;
    if (inputValue.length > 3) {
      this.showMaxLengthError = true;
    } else {
      this.showMaxLengthError = false;
    }
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
    if (this.duplicateCheck.cmastercheckDuplicateCode(code, this.cmaster)) {
      return { duplicateCode: true };
    }
    return null;
  }

  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (this.duplicateCheck.cmastercheckDuplicateCode(name, this.cmaster)) {
      return { duplicateName: true };
    }
    return null;
  }



}

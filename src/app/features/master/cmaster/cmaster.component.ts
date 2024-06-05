import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
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
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { NotificationService } from '../../../services/notification/notification.service';
@Component({
  selector: 'app-cmaster',
  standalone: true,
  imports: [HeaderComponent, MatIconModule, RouterModule, FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    UpperCaseDirective,
    MatTableModule, MatSlideToggleModule, MatCheckboxModule, SpinnerComponent
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
  loading: boolean = false;
  showMaxLengthError: boolean = false;
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private notifiacation = inject(NotificationService);
  private duplicateCheck = inject(DuplicatecheckService)
  constructor() {
    this.loading = true;
    this.cmasterForm = this.formBuilder.group({
      VC_Code: ['', [
        Validators.required,
        Validators.maxLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$'),
        this.duplicateCodeValidator.bind(this),
      ]],
      VC_Name: ['', [Validators.required,
      
      ]],
      VC_RegName: ['', [Validators.required]],
      VC_Active: [true]
    });
  }


  ngOnInit(): void {
    this.loading = true;
    this.getcmaster();
  }
  // view prathishta
  getcmaster() {
    this.loading = true;
    this.masterService.getCmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.cmaster = data;
          this.filteredCmaster = this.cmaster;
          this.loading = false
        }
      },
      error: (error) => {
        this.notifiacation.showError(error);
        this.loading = true;

      }
    });
  }

  // get pmaster form controls
  get cmasterFormControl() {
    return this.cmasterForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: Cmaster) {
    this.loading = true;
    if (this.cmasterForm.valid) {
      this.masterService.createCmaster(data).subscribe({
        next: (res) => { 
            this.notifiacation.showSuccess("Category details added successfully");
            this.onReset();
            this.ngOnInit();
            this.loading = false;
        },
        error: (error) => {
          console.log(error);
        }
      })
    } else {
      this.markFormGroupTouched(this.cmasterForm);
      this.notifiacation.showWarning("Please Fill the details");
      this.loading = false;
    }

  }

  // resetting form controls
  onReset() {
    this.loading = true;
    this.cmasterForm.reset({
      VC_Active: true,

    });
    this.updateFlag = false;
    this.loading = false;
  }

  //for editing the form fields
  onEdit(data: Cmaster) {
    this.loading = true;
    this.Id = data.VC_ID;
    this.updateFlag = true;
    this.cmasterForm.patchValue({
      VC_Code: data.VC_Code,
      VC_Name: data.VC_Name,
      VC_RegName: data.VC_RegName,
      VC_Active: data.VC_Active == "Y" ? true : false

    });
    this.loading = false;
  }

  //update data
  onUpdate(updatedata: Cmaster) {
    this.loading = true;
    if (this.cmasterForm.valid) {
      this.masterService.updateCmaster(this.Id, updatedata).subscribe((res) => {
        this.notifiacation.showSuccess("Category Details updated successfully")
        this.onReset();
        this.ngOnInit();
        this.loading = false;
      })
    }
    else {
      this.markFormGroupTouched(this.cmasterForm);
      this.notifiacation.showWarning(" Please Fill the  details")
      this.loading = false;
    }
  }
  // deleteData
  onDelete(id: string) {
    this.loading = true;
    this.masterService.deleteCmaster(id).subscribe((res) => {
      this.notifiacation.showError(" Category Details deleted success fully")
      this.ngOnInit();
      this.loading = false;
    })
  }

  // search functionality by pname
  onSearch() {
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
      if (this.duplicateCheck.cmastercheckDuplicateCode(code, this.cmaster)) {
        return { duplicateCode: true };
      }
      return null;

    }

  }

  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (this.updateFlag) {
      return null
    } else {
      if (this.duplicateCheck.cmastercheckDuplicateCode(name, this.cmaster)) {
        return { duplicateName: true };
      }
      return null;
    }

  }



}

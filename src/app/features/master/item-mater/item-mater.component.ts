import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ItemMaster } from '../../../models/item-master.model';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';
@Component({
  selector: 'app-item-mater',
  standalone: true,
  imports: [
    HeaderComponent,
    MatIconModule,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    UpperCaseDirective,
    MatTableModule,
    MatSlideToggleModule,
  ],
  templateUrl: './item-mater.component.html',
  styleUrl: './item-mater.component.css',
})
export class ItemMAterComponent {
  itemMaster: ItemMaster[] = [];
  filtereditemMaster: ItemMaster[] = [];
  showNoRecordsMessage: boolean = false;
  itemMasterForm: FormGroup;
  updateFlag: boolean = false;
  searchQuery: string = '';
  Id: string = '';
  showMaxLengthError: boolean = false;
  userId: string | null;
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
  private duplicateCheck = inject(DuplicatecheckService);
  templeName:string |null ;
  constructor() {
    this.templeName=localStorage.getItem('TempleName') 
    this.userId = localStorage.getItem('LoginId');
    this.itemMasterForm = this.formBuilder.group({
      NM_Code: [
        '',
        [
          Validators.required,
          Validators.maxLength(3),
          Validators.pattern('^[a-zA-Z0-9]+$'),
          this.duplicateCodeValidator.bind(this),
        ],
      ],
      NM_Name: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Zs]+$'),
          this.duplicateNameValidator.bind(this),
        ],
      ],
      NM_RName: [''],
      NM_Description: [''],
    });
  }
  ngOnInit(): void {
    this.getItemMaster();
  }
  // view prathishta
  getItemMaster() {
    const payLoad = {
      Type: 'NadavaravuALL',
      Code: '',
    };
    this.masterService.getItemMaster(payLoad).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // console.log(data)
          this.itemMaster = data;
          console.log(this.itemMaster);
          this.filtereditemMaster = this.itemMaster;
          console.log(this.filtereditemMaster, 'filteredmaster');
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // get pmaster form controls
  get itemMasterFormControl() {
    return this.itemMasterForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: ItemMaster) {
    console.log(data, 'insert item master');

    const obj = this.itemMasterForm.value;
    if (this.itemMasterForm.valid) {
      const payload = {
        NMId: '',
        NMCode: data.NM_Code,
        NMName: data.NM_Name,
        NMRName: data.NM_RName,
        NMDescription: data.NM_Description,
        Cuser: this.userId,
        Type: 'INSERT',
      };

      this.masterService.createItemMaster(payload).subscribe({
        next: (res) => {
          this.openSnackBar(
            ' Item Details created sussess fully',
            'close',
            'success-snackbar'
          );
          this.getItemMaster();
          console.log(res, 'respobs');
          this.onReset();
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      this.markFormGroupTouched(this.itemMasterForm);
    }
  }
  // resetting form controls
  onReset() {
    this.itemMasterForm.reset();
    this.updateFlag = false;
  }

  //for editing the form fields
  onEdit(data: ItemMaster) {
    console.log(data);
    this.Id = data.NM_Id;
    this.updateFlag = true;
    this.itemMasterForm.patchValue({
      NM_Code: data.NM_Code,
      NM_Name: data.NM_Name,
      NM_RName: data.NM_RName,
      NM_Description: data.NM_Description,
    });
  }

  //update data
  onUpdate(updatedata: ItemMaster) {
    console.log(updatedata, 'hhhhhhhhhhhhhhhh');
    const payload = {
      NMId: this.Id,
      NMCode: updatedata.NM_Code,
      NMName: updatedata.NM_Name,
      NMRName: updatedata.NM_RName,
      NMDescription: updatedata.NM_Description,
      Cuser: this.userId,
      Type: 'UPDATE',
    };
    this.masterService.updateItemMaster(payload).subscribe((res) => {
      this.openSnackBar(
        ' Item Details updated sussess fully',
        'close',
        'success-snackbar'
      );

      console.log(res);
      this.getItemMaster();
      this.itemMasterForm.reset();
    });
  }

  // deleteData
  onDelete(id: string) {
    console.log(id);
    const payLoad = { Type: 'Nadavaravu', Id: id };
    this.masterService.deleteItemMaster(payLoad).subscribe((res) => {
      this.openSnackBar(
        ' Item Details deleted sussess fully',
        'close',
        'success-snackbar'
      );
      this.getItemMaster();
      console.log(res);
    });
  }

  // search functionality by pname
  onSearch(searchQuery: string) {
    if (!this.searchQuery.trim()) {
      this.filtereditemMaster = this.itemMaster;
    } else {
      this.filtereditemMaster = this.itemMaster.filter((data) => {
        console.log(data);
        return data.NM_Name.toLowerCase().includes(this.searchQuery);
      });
    }
  }

  // snack  message
  openSnackBar(message: string, action: string, classname: string) {
    this._snackBar.open(message, action, {
      panelClass: classname,
      horizontalPosition: 'end',
      verticalPosition: 'top',
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
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // duplicate code check validators
  duplicateCodeValidator(control: AbstractControl): ValidationErrors | null {
    const code = control.value;
    if (
      this.duplicateCheck.itemMastercheckDuplicateCode(code, this.itemMaster)
    ) {
      return { duplicateCode: true };
    }
    return null;
  }

  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (
      this.duplicateCheck.itemMastercheckDuplicateName(name, this.itemMaster)
    ) {
      return { duplicateName: true };
    }
    return null;
  }

  
}

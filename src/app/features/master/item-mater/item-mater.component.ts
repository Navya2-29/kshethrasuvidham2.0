
import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, NgForm, ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
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
  imports: [HeaderComponent, MatIconModule, RouterModule, FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    UpperCaseDirective,
    MatTableModule, MatSlideToggleModule,

  ],
  templateUrl: './item-mater.component.html',
  styleUrl: './item-mater.component.css'
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

  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
  private duplicateCheck = inject(DuplicatecheckService);
  constructor() {

    this.itemMasterForm = this.formBuilder.group({
      item_code: ['', [
        Validators.required,
        Validators.maxLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$'),
        this.duplicateCodeValidator.bind(this),

      ]],
      item_name: ['', [Validators.required,
      Validators.pattern('^[a-zA-Z\s]+$'),
      this.duplicateNameValidator.bind(this),

      ]],
      item_decription: ['']
    });
  }
  ngOnInit(): void {
    this.getItemMaster();
  }
  // view prathishta
  getItemMaster() {
    this.masterService.getItemMaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // console.log(data)
          this.itemMaster = data;
          this.filtereditemMaster = this.itemMaster
        }
      },
      error: (error) => {
        console.log(error);
      }
    });


  }

  // get pmaster form controls
  get itemMasterFormControl() {
    return this.itemMasterForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: ItemMaster) {


    const obj = this.itemMasterForm.value;
    if (this.itemMasterForm.valid) {

      this.masterService.createItemMaster(data).subscribe({
        next: (res) => {

          this.openSnackBar(" categoery Details created sussess fully", "close", "success-snackbar");

          console.log(res);
          this.onReset();


        },
        error: (error) => {
          console.log(error);
        }
      })
    }
    else{
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
    this.Id = data.id;
    this.updateFlag = true;
    this.itemMasterForm.patchValue({
      item_code: data.item_code,
      item_name: data.item_name,
    });
  }

  //update data
  onUpdate(updatedata: ItemMaster) {
    console.log(updatedata);

    this.masterService.updateItemMaster(this.Id, updatedata).subscribe((res) => {
      this.openSnackBar(" category Details updated sussess fully", "close", "success-snackbar");

      console.log(res);
      this.getItemMaster();
    })
  }
  // deleteData
  onDelete(id: string) {
    this.masterService.deleteItemMaster(id).subscribe((res) => {
      this.openSnackBar(" category Details deleted sussess fully", "close", "success-snackbar");

      console.log(res);
    })
  }

  // search functionality by pname
  onSearch(searchQuery: string) {
    if (!this.searchQuery.trim()) {
      this.filtereditemMaster = this.itemMaster;
    }

    else {
      this.filtereditemMaster = this.itemMaster.filter((data) => {
        console.log(data)
        return data.item_name.toLowerCase().includes(this.searchQuery);
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
    if (this.duplicateCheck.itemMastercheckDuplicateCode(code, this.itemMaster)) {
      return { duplicateCode: true };
    }
    return null;
  }

  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (this.duplicateCheck.itemMastercheckDuplicateName(name, this.itemMaster)) {
      return { duplicateName: true };
    }
    return null;
  }

}

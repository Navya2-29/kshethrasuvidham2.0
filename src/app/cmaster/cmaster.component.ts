import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, NgForm, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Pmaster, CreatePmaster } from '../models/pmaster.model';
import { MasterService } from '../services/master/master.service';
import { CommonModule } from '@angular/common';
import { UpperCaseDirective } from '../shared/directives/upper-case.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Cmaster, CreateCmaster } from '../models/cmaster.model';
@Component({
  selector: 'app-cmaster',
  standalone: true,
  imports: [HeaderComponent, MatIconModule, RouterModule, FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    UpperCaseDirective,
    MatTableModule, MatSlideToggleModule,

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
  showMaxLengthError:boolean=false;
  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
  constructor() {

    this.cmasterForm = this.formBuilder.group({
      CM_Code: ['', [
        Validators.required,
        Validators.maxLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]],
      CM_NameEng: ['', [Validators.required,
      Validators.pattern('^[a-zA-Z\s]+$')
      ]],
    });
  }
  ngOnInit(): void {
    this.getcmaster();
  }
  // view prathishta
  getcmaster() {
    this.masterService.getCmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // console.log(data)
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
  onSubmit(data: CreateCmaster) {


    const obj = this.cmasterForm.value;
    this.masterService.createCmaster(data).subscribe({
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
  // resetting form controls
  onReset() {
    this.cmasterForm.reset();
    this.updateFlag = false;


  }

  //for editing the form fields
  onEdit(data: Cmaster) {
    console.log(data);
    this.Id=data.id;
    this.updateFlag = true;
    this.cmasterForm.patchValue({
      CM_Code: data.CM_Code,
      CM_NameEng: data.CM_NameEng,
    });
  }

  //update data
  onUpdate(updatedata: Pmaster) {
    console.log(updatedata);
    
    this.masterService.updatePmaster(this.Id, updatedata).subscribe((res) => {
      this.openSnackBar(" category Details updated sussess fully", "close", "success-snackbar");

      console.log(res);
      this.getcmaster();
    })
  }
  // deleteData
  onDelete(id: string) {
    this.masterService.delete(id).subscribe((res) => {
      this.openSnackBar(" category Details deleted sussess fully", "close", "success-snackbar");

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
        return data.CM_NameEng.toLowerCase().includes(this.searchQuery);
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

}

import { Component, OnInit, ViewChild } from '@angular/core';
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
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-pmaster',
  standalone: true,
  imports: [HeaderComponent,
    MatIconModule,
    RouterModule,
    MatSlideToggleModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    UpperCaseDirective
  ],
  templateUrl: './pmaster.component.html',
  styleUrl: './pmaster.component.css',

})
export class PmasterComponent implements OnInit {
  pmaster: Pmaster[] = [];
  showNoRecordsMessage: boolean = false;
  pmasterForm: FormGroup;
  updateFlag: boolean = false;
  searchQuery: string = '';
  selectedFile: File;
  fileError: string | null = null;
  @ViewChild('fileInput') fileInput: any;
  imagePreview: string | ArrayBuffer | null = null; 
  fileInputMessageFlag:boolean=true;
  
  constructor(private masterService: MasterService, private formBuilder: FormBuilder,private _snackBar: MatSnackBar) {

    // form model
    this.pmasterForm = this.formBuilder.group({
      PM_Code: ['', [
        Validators.required,
        Validators.maxLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]],
      PM_NameEng: ['', [Validators.required,
      Validators.pattern('^[a-zA-Z\s]+$')
      ]],
      PM_Name: ['', Validators.required],
      imgurl: ['',]
    });
  }


  ngOnInit(): void {
    this.getPmaster();
    
  }

  // view prathishta
  getPmaster() {
    this.masterService.getPmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // console.log(data)
          this.pmaster = data;
        }
      },
      error: (error) => {
        console.log(error);
      }
    });


  }

  // get pmaster form controls
  get pmasterFormFormControl() {
    return this.pmasterForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: CreatePmaster) {
    // console.log(data);
    this.openSnackBar(" Prathishta Details created sussess fully", "close","success-snackbar");
    const obj = this.pmasterForm.value;
    this.masterService.createPmaster(data).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
  // resetting form controls
  onReset() {
    this.pmasterForm.reset();
    this.updateFlag = false;
    this.fileInput.nativeElement.value = '';
    this.fileInputMessageFlag=true;
    this.imagePreview='';
    
  }

  //for editing the form fields
  onEdit(data: Pmaster) {
    console.log(data);
    this.updateFlag = true;
    this.pmasterForm.patchValue({
      PM_Code: data.PM_Code,
      PM_NameEng: data.PM_NameEng,
      PM_Name: data.PM_Name,
      imgurl: data.imgurl
    });
  }

  //update data
  onUpdate(updatedata: Pmaster) {
    console.log(updatedata);
    this.openSnackBar(" Prathishta Details updated sussess fully", "close","success-snackbar");
    let id: string = '';
    this.masterService.updatePmaster(id, updatedata).subscribe((res) => {
      console.log(res)
    })
  }
  // deleteData
  onDelete(id: string) {
    this.openSnackBar(" Prathishta Details deleted sussess fully", "close","delete-snackbar");
    this.masterService.delete(id).subscribe((res) => {
      console.log(res);
    })
  }

  // search functionality by pname
  onSearch(searchQuery: string) {
    console.log(searchQuery)
    console.log(this.pmaster)
    this.pmaster = this.pmaster.filter((data) => {

      console.log(data)
      return data.PM_NameEng.toLowerCase().includes(this.searchQuery);
    });
  }

// snack  message
openSnackBar(message: string, action: string,classname:string) {
  this._snackBar.open(message, action,{
    panelClass: classname,
    horizontalPosition: "end",
    verticalPosition: "top",
  });
}
// for previewing uploaded image
previewImage(event: any) {
  this.fileInputMessageFlag=false;
  
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}



}




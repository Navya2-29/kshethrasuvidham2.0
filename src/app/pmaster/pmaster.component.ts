import { Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';

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
    UpperCaseDirective,
    MatTableModule
  ],
  templateUrl: './pmaster.component.html',
  styleUrl: './pmaster.component.css',

})
export class PmasterComponent implements OnInit {
  pmaster: Pmaster[] = [];
  filteredPmaster:Pmaster[]=[];
  showNoRecordsMessage: boolean = false;
  pmasterForm: FormGroup;
  updateFlag: boolean = false;
  searchQuery: string = '';
  selectedFile: File;
  fileError: string | null = null;
  @ViewChild('fileInput') fileInput: any;
  imagePreview: string | ArrayBuffer | null = null; 
  fileInputMessageFlag:boolean=true;
Id:string='';
  
  private masterService=inject(MasterService);
  private formBuilder=inject(FormBuilder);
  private _snackBar=inject(MatSnackBar);

  constructor() {
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
          this.filteredPmaster=this.pmaster
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
// console.log(data.PM_Code,data.PM_NameEng,this.selectedFile.name);
//     const formData = new FormData();
//     formData.append('PM_Code', data.PM_Code);
//     formData.append('PM_NameEng',data.PM_NameEng);
//     formData.append('PM_Name',data.PM_Name);
//     formData.append('imgurl', this.selectedFile.name);
//      console.log(formData);
    // this.openSnackBar(" Prathishta Details created sussess fully", "close","success-snackbar");

    // const obj = this.pmasterForm.value;
    if(this.pmasterForm.valid){
    this.masterService.createPmaster(data).subscribe({
      next: (res) => {
        console.log(res);
        this.openSnackBar(" Prathishta Details created sussess fully", "close","success-snackbar");

        this.onReset();
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
  else{
    this.markFormGroupTouched(this.pmasterForm);

  }
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
    this.Id=data.id;
    this.pmasterForm.patchValue({
      PM_Code: data.PM_Code,
      PM_NameEng: data.PM_NameEng,
      PM_Name: data.PM_Name,
      imgurl: data.imgurl
    });
  }

  //update data
  onUpdate(updatedata: Pmaster) {
    console.log(updatedata,this.Id);
   
    this.masterService.updatePmaster(this.Id, updatedata).subscribe((res) => {
      this.openSnackBar(" Prathishta Details updated sussess fully", "close","success-snackbar");

      console.log(res)
    })
  }
  // deleteData
  onDelete(id: string) {
    this.masterService.delete(id).subscribe((res) => {
      console.log(res);
      this.openSnackBar(" Prathishta Details deleted sussess fully", "close","success-snackbar");

    })
  }

  // search functionality by pname
  onSearch(searchQuery: string) {
    if (!this.searchQuery.trim()) {
      this.filteredPmaster = this.pmaster;
    }
  
else{
    this.filteredPmaster = this.pmaster.filter((data) => {
      console.log(data)
      return data.PM_NameEng.toLowerCase().includes(this.searchQuery);
    });
  }
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
  this.selectedFile = event.target.files[0];
  // const file = event.target.files[0];
  if (this.selectedFile) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(this.selectedFile);
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

}




import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, NgForm, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Pmaster, CreatePmaster } from '../models/pmaster.model';
import { Observable } from 'rxjs';
import { MasterService } from '../services/master/master.service';
import { CommonModule } from '@angular/common';
import { UpperCaseDirective } from '../shared/directives/upper-case.directive';


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
  constructor(private masterService: MasterService, private formBuilder: FormBuilder) {

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

  onReset() {
    this.pmasterForm.reset();
    this.updateFlag = false;
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
    let id: string = '';
    this.masterService.updatePmaster(id, updatedata).subscribe((res) => {
      console.log(res)
    })
  }
  // deleteData
  onDelete(id: string) {
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




}

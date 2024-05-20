import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../services/master/master.service';

@Component({
  selector: 'app-member-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,MatIconModule,MatButtonModule,CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './member-master.component.html',
  styleUrl: './member-master.component.css'
})
export class MemberMasterComponent implements OnInit{
  rows: any[] = [];
memeberForm:FormGroup;


private formBuilder=inject(FormBuilder);
private masterService=inject(MasterService);
  // constructor
  constructor(){
  this.addRow();
 }

ngOnInit(): void {
  this.memeberForm = this.formBuilder.group({
    
      name: [''],
      address1: [''],
      address2: [''],
      star: [''],
      phone: [''],
      mobile: [''],
      email: [''],
      relativesDetails:this.formBuilder.array([])
    })
    this.addRelativeDetails();
  
}


get relativesDetails(){
  return this.memeberForm.controls["relativesDetails"] as FormArray;
}
  addRow() {
    this.rows.unshift({});
  }
  deleteRow(index: number): void {
    this.rows.splice(index, 1);
  }
 

  addRelativeDetails() {
    const relativeForm = this.formBuilder.group({
      relativeName: ['', Validators.required],
      star: ['', Validators.required],
      realtion:['',Validators.required]

    });
    this.relativesDetails.push(relativeForm);
  }

  deleteRelativeDetails(lessonIndex: number) {
    this.relativesDetails.removeAt(lessonIndex);
  }
  onSubmit(data:any){
    console.log(data);

  }

  
}

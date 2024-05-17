import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-seasonal-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,MatInputModule,CommonModule,AsyncPipe,MatIconModule,MatButtonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './seasonal-master.component.html',
  styleUrl: './seasonal-master.component.css'
})
export class SeasonalMasterComponent implements OnInit {
seasonalBlockingForm:FormGroup;


private formBuilder= inject(FormBuilder);
constructor(){
  this.seasonalBlockingForm=this.formBuilder.group({
    VS_code:['',[Validators.required]],
    VM_name:['',[Validators.required]],
    VS_fromDate:[new Date(),[Validators.required]],
    VS_toDate:[new Date(),[Validators.required]],
  })
}
  ngOnInit(): void {
    
  }
  get SeasonalFormControl(){
    return this.seasonalBlockingForm.controls;

  }
}

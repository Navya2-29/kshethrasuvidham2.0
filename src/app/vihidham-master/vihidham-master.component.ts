import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-vihidham-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,MatIconModule,MatButtonModule,MatInputModule,ReactiveFormsModule],
  templateUrl: './vihidham-master.component.html',
  styleUrl: './vihidham-master.component.css'
})
export class VihidhamMasterComponent {
  vihidhamMasterForm:FormGroup;


  private formBuilder=inject(FormBuilder)
constructor(){
  this.vihidhamMasterForm=this.formBuilder.group({
    vihidham_code:['',Validators.required],
    vihidham_name:['',Validators.required],
    account_head:['',Validators.required],
    account_subHead:['',Validators.required],
    type:['',Validators.required],
    pvItem:['']

  })
}
}

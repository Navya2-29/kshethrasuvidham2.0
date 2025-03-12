import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { MasterService } from '../../../services/master/master.service';
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [   MatFormFieldModule,
    MatInputModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
   changepasswordForm:FormGroup;
   loginId:string | null;
  constructor( private fb:FormBuilder, private service:MasterService){
    this.loginId=localStorage.getItem("LoginId")
  this.changepasswordForm=this.fb.group({
   oldPassword:['',[Validators.required]],
   newPassword:['',[Validators.required]],
})
  }



  onSubmit(){
    const payLoad={
      "LoginId":this.loginId,
      "password":this.changepasswordForm.get("newPassword")?.value

    }
this.service.changePassword(payLoad).subscribe((data)=>{
  console.log(data);
})
  }

}

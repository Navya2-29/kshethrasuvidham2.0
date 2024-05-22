import { Component, OnInit, inject } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../services/master/master.service';
import { Login } from '../models/login.model';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, RouterModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  hide:false;
  loginForm:FormGroup;
  login:Login={userName:'',password:''}
  private formBuilder=inject(FormBuilder);
  private masterService=inject(MasterService);
  private router=inject(Router);
  constructor(){
       
  }
  ngOnInit(): void {
    
    this.loginForm=this.formBuilder.group({
      userName:['',[Validators.required]],
      password:['',[Validators.required]]
   })
  }

onSubmit(login:any){
console.log(login+"jjk");
let userName=login.userName;
let password=login.password;
console.log(userName,password)
if(userName=="admin" && password=="bbb"){
  this.router.navigate(['/dashboard']);
}
else{
  this.router.navigate(['/login'])
}

this.masterService.login().subscribe((res)=>{
  this.login=res;
let userName=login.userName;
let password=login.password;
console.log(userName,password)
if(userName=="admin" && password=="bbb"){
  this.router.navigate(['/dashboard']);
}
else{
  this.router.navigate(['/login'])
}
})
  }


}

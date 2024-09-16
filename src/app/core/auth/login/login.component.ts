import { Component, OnInit, inject } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Login } from '../../../models/login.model';
import { AuthService } from '../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule,CommonModule, MatIconModule, MatButtonModule,SpinnerComponent, RouterModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  hide:boolean=true;
  loginForm:FormGroup;
  loading:boolean=false;
  errorMessage="";
  private readonly formBuilder=inject(FormBuilder);
  private readonly authService=inject(AuthService);
  private readonly router=inject(Router);
  constructor(private http:HttpClient){    
  }
  ngOnInit(): void {
    this.loginForm=this.formBuilder.group({
      username:['',[Validators.required]],
      password:['',[Validators.required]]
   })
   this.autoLogin();
  }

submitLogin(login:Login){
  this.loading=true;
  this.errorMessage='';
  console.log(login);
  if(login.username=="admin" && login.password=="bbb"){
    console.log(login)
    this.authService.getLoginInfo(login).subscribe({
      next:(response)=>{
        console.log(response);
        if (response.alertmsg === "Login Sucessfully") {
          console.log(response.alertmsg);
          // Storing relevant details in localStorage
          localStorage.setItem('name', response.name);
          localStorage.setItem('username', response.username);
          localStorage.setItem('password', response.password);
          localStorage.setItem('alertmsg', response.alertmsg);
          localStorage.setItem('loggedIn', 'true');
          // Optional: Redirect to the dashboard or another page
          this.router.navigate(['/dashboard']);
        } else {
          // Handle case when login is not successful
          this.errorMessage = response.alertmsg; // Show the error message
        }
        // localStorage.setItem('loggedIn', 'true');
          // this.router.navigate(['/dashboard']);
        this.loading=false;
        this.loginForm.reset();
      },
      error:(error)=>{
    console.error(error);
      }
    })
  }
  else{
    this.errorMessage="enter valid username or password";
  }

}
autoLogin(){
  const login=localStorage.getItem('loggedIn');
  console.log(login);
  if(login){
    this.router.navigate(['/dashboard']);
  }
}



}

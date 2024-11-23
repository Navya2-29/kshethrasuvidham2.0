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
import { MatDialog } from '@angular/material/dialog';
import { CouterPopupComponent } from '../../couter-popup/couter-popup.component';
import { MasterService } from '../../../services/master/master.service';

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
  templeName:string;
  logo:string;
  todayDate:Date=new Date();
  private readonly formBuilder=inject(FormBuilder);
  private readonly authService=inject(AuthService);
  private readonly router=inject(Router);
  constructor(private http:HttpClient, private dialog: MatDialog, private  service:MasterService){    
  }
  ngOnInit(): void {
this.getTempleData()
    const storedCounterId = localStorage.getItem('counterId');
    if (!storedCounterId) {
      // Open the dialog if the Counter ID is not found
      this.openCounterIdDialog();
    }


    this.loginForm=this.formBuilder.group({
      username:['',[Validators.required]],
      password:['',[Validators.required]]
   })
   this.autoLogin();
  }



  openCounterIdDialog(): void {
    const dialogRef = this.dialog.open(CouterPopupComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Store the entered Counter ID in localStorage
        localStorage.setItem('counterId', result);
      }
    });
  }


submitLogin(login:Login){
  this.loading=true;
  this.errorMessage='';
  console.log(login);
  if(login.username && login.password){
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
          localStorage.setItem('Role', response.Role);
          localStorage.setItem('LoginId',response.LoginId);
          localStorage.setItem('loggedIn', 'true');
          // Optional: Redirect to the dashboard or another page
          this.router.navigate(['/front']);
        } else {
          // Handle case when login is not successful
          this.errorMessage = response.alertmsg; // Show the error message
          this.errorMessage="enter valid username or password";
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
    this.errorMessage="Please Enter your Username and Password";
  }
}

autoLogin(){
  const login=localStorage.getItem('loggedIn');
  console.log(login);
  if(login){
    this.router.navigate(['/front']);
  }else{
    this.router.navigate(['/login']);
  }
}

getTempleData(){
  this.service.settingsData().subscribe((data)=>{
    console.log(data);
    this.templeName=data[0].Name;
    this.logo=data[0].logo;
    localStorage.setItem('TempleName',this.templeName);
    localStorage.setItem('Address',data[0].Address);
    localStorage.setItem('Logo',this.logo)
    
  })
}

getLogoUrl(): string {
  return `assets/images/${this.logo}`;  // Assuming logo images are stored in the 'assets/images' folder
}

}

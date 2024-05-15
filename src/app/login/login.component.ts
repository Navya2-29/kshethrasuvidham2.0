import { Component, OnInit, inject } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, RouterModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  hide = true;
  loginForm:FormGroup;
  private formBuilder=inject(FormBuilder);
  private authservice=inject(AuthService);
  constructor(){
       this.loginForm=this.formBuilder.group({
          userName:['',[Validators.required]],
          password:['',[Validators.required]]
       })
  }
  ngOnInit(): void {
    

  }

onSubmit(login:any){
console.log(login+"jjk");
this.authservice.login(login).subscribe((res)=>{
  
})
  }


}

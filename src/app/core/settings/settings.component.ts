import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../layout/header/header.component';
import { SpinnerComponent } from '../../shared/component/spinner/spinner.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../services/master/master.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,FormsModule,ReactiveFormsModule, MatIconModule,
      MatInputModule,CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  settingsForm:FormGroup;
  loading:boolean=false;
  templeName:string | null;

  private formBuilder = inject(FormBuilder);
    private masterService = inject(MasterService);
     private notification = inject(ToastrService);
     constructor(private router:Router){

  this.templeName=localStorage.getItem('TempleName') ;


  this.settingsForm=this.formBuilder.group({
    templeName:['',Validators.required],
    templeAddress:['',Validators.required],
    language:['',Validators.required],
    printer:['',Validators.required],
    logo:['',Validators.required],
    Counter:['',Validators.required]

  })
}




  gotoDashBoard(){

    this.router.navigate(['/dashboard']);

  }
}

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MasterService } from '../../../services/master/master.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-front',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, RouterModule,CommonModule],
  templateUrl: './front.component.html',
  styleUrl: './front.component.css'
})
export class FrontComponent {

  hide:boolean=true;

  loading:boolean=false;
  errorMessage="";
  templeName:string | null;
  logo:string | null;
  todayDate:Date=new Date();
  
 
  constructor(private http:HttpClient, private dialog: MatDialog, private  service:MasterService){    
  }
  ngOnInit(): void {
this.templeName=localStorage.getItem('TempleName')
    const storedCounterId = localStorage.getItem('counterId');
    this.logo=localStorage.getItem('Logo');
  }
  
  getLogoUrl(): string {
    return `assets/images/${this.logo}`;  // Assuming logo images are stored in the 'assets/images' folder
  }


  
}

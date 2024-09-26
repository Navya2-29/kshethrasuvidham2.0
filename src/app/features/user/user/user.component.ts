import { Component } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [HeaderComponent,CommonModule,SpinnerComponent,MatIconModule,FormsModule,ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
loading:boolean=false;
}

import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../services/master/master.service';
import { DuplicatecheckService } from '../services/duplicateCheckValidator/duplicatecheck.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-vazhipad-blocking',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,MatIconModule,MatButtonModule,CommonModule,ReactiveFormsModule,MatFormFieldModule],
  templateUrl: './vazhipad-blocking.component.html',
  styleUrl: './vazhipad-blocking.component.css'
})
export class VazhipadBlockingComponent {


 
}

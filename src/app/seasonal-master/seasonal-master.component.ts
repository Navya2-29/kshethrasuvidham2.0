import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-seasonal-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,MatInputModule,MatIconModule,MatButtonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './seasonal-master.component.html',
  styleUrl: './seasonal-master.component.css'
})
export class SeasonalMasterComponent {

}

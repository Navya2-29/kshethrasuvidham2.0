import { Component } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,MatIconModule,CommonModule],
  templateUrl: './star-master.component.html',
  styleUrl: './star-master.component.css'
})
export class StarMasterComponent {



}

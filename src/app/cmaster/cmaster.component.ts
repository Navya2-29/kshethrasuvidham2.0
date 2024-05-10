import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-cmaster',
  standalone: true,
  imports: [HeaderComponent, MatIconModule, RouterModule, MatSlideToggleModule],
  templateUrl: './cmaster.component.html',
  styleUrl: './cmaster.component.css'
})
export class CmasterComponent {

  

}

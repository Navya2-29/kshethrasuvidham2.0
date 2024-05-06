import { Component } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MobserachbtnComponent} from '../mobserachbtn/mobserachbtn.component';

@Component({
  selector: 'app-fixedbottom',
  standalone: true,
  imports: [MatInputModule, MatButtonModule,MobserachbtnComponent],
  templateUrl: './fixedbottom.component.html',
  styleUrl: './fixedbottom.component.css'
})
export class FixedbottomComponent {

}

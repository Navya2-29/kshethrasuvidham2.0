import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-menuitems',
  standalone: true,
  imports: [MatDialogModule,MatButtonModule, RouterModule],
  templateUrl: './menuitems.component.html',
  styleUrl: './menuitems.component.css'
})
export class MenuitemsComponent {
templeName:string |null;
  constructor(){
   this.templeName=localStorage.getItem('TempleName') 
  }

  
}

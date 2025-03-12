import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-menuitems',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, RouterModule,CommonModule],
  templateUrl: './menuitems.component.html',
  styleUrl: './menuitems.component.css',
})

export class MenuitemsComponent {
  templeName: string | null;
  role: string | null;
  lang:string | null;
  constructor( private ts:TranslateService ) {
    this.lang=localStorage.getItem('Language') || 'en';
    this.templeName = localStorage.getItem('TempleName');
    this.role = localStorage.getItem('Role');
    console.log(this.role );
  }

  masterLinks = [
  
    { label: 'Category Master', path: '/cmaster' },
    
    { label: 'Prathishta Master', path: '/pmaster' },
    
    { label: 'Vazhipad Master', path: '/vmaster' },
   
    { label: 'Vazhipad Blocking', path: '/vazhipad-blocking' },
    
    { label: 'Vazhipad Seasonal', path: '/seasonal' },
    { label: 'Day Master', path: '/day-master' },
    
    { label: 'Item Master', path: '/item-master' },
    
    { label: 'Devotee Master', path: '/member-master' },
  ];

  onLinkClick(event: Event): void {
    if (this.role === 'staff') {
      event.preventDefault(); 
    }
  }
  

}

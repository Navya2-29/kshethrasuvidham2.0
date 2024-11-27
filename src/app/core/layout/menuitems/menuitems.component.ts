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
  constructor( private ts:TranslateService ,private cdRef: ChangeDetectorRef) {
    this.lang=localStorage.getItem('Language') || 'en';
    this.templeName = localStorage.getItem('TempleName');
    this.role = localStorage.getItem('Role');
    console.log(this.role );
  }

  masterLinks = [
  
    { label: 'Category Master', path: '/cmaster' },
    // { label: 'വിഭാഗം  മാസ്റ്റർ', path: '/cmaster' },
    { label: 'Prathishta Master', path: '/pmaster' },
    // { label: 'പ്രതിഷ്ഠ മാസ്റ്റർ', path: '/pmaster' },
    { label: 'Vazhipad Master', path: '/vmaster' },
    // { label: 'വഴിപാട് മാസ്റ്റർ ', path: '/vmaster' },
    // { label: 'Vazhipad Blocking', path: '/vazhipad-blocking' },
    // { label: 'വഴിപാട് സീസണൽ ', path: '/seasonal' },
    { label: 'Vazhipad Seasonal', path: '/seasonal' },
    // { label: 'Vihidham Master', path: '/vihidham-master' },
    // { label: 'Member Master', path: '/member-master' },
    { label: 'Day-Master', path: '/day-master' },
    // { label: 'ദിവസം മാസ്റ്റർ ', path: '/day-master' },
    // { label: 'Special day master', path: '/special-day-master' },
    // { label: 'Combo-master ', path: '/combo-master' },
    { label: 'Item/Nadavarav Master', path: '/item-master' },
    // { label: 'ഇനം/നടവരവ്  മാസ്റ്റർ', path: '/item-master' },
    
  ];

  onLinkClick(event: Event): void {
    if (this.role !== 'admin') {
      event.preventDefault(); // Prevent navigation if not admin
    }
  }
  
  changeLanguage(lang:any){
    const selectedlang=lang.target.value;
    localStorage.setItem('Language',selectedlang)
    this.ts.use(selectedlang);
    this.cdRef.detectChanges();
    
  }

}

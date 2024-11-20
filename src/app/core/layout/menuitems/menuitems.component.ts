import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  constructor() {
    this.templeName = localStorage.getItem('TempleName');
    this.role = localStorage.getItem('Role');
    console.log(this.role );
  }

  masterLinks = [
    { label: 'Prathishta Details', path: '/pmaster' },
    { label: 'Vazhipad Category', path: '/cmaster' },
    { label: 'Vazhipad Master', path: '/vmaster' },
    { label: 'Vazhipad Blocking', path: '/vazhipad-blocking' },
    { label: 'Vazhipad Seasonal', path: '/seasonal' },
    { label: 'Vihidham Master', path: '/vihidham-master' },
    { label: 'Member Master', path: '/member-master' },
    { label: 'Day-Master', path: '/day-master' },
    { label: 'Special day master', path: '/special-day-master' },
    { label: 'Combo-master ', path: '/combo-master' },
    { label: 'Item Master', path: '/item-master' },
    
  ];

  onLinkClick(event: Event): void {
    if (this.role !== 'admin') {
      event.preventDefault(); // Prevent navigation if not admin
    }
  }
  
  

}

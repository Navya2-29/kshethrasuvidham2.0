import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MenuComponent } from '../menu/menu.component';
import { AreaComponent } from '../../../features/Billing/area/area.component';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MenuComponent,
    AreaComponent,
    MatMenuModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private router = inject(Router);
  showFiller = false;
  userName: string | null = '';
  role:string |null='';
  constructor() {
    this.userName = localStorage.getItem('name');
    this.role=localStorage.getItem('Role')
  }

  logout() {
    localStorage.setItem('loggedIn', 'false');
    localStorage.removeItem('name');
    localStorage.removeItem('Role');
    localStorage.removeItem('alertmsg');
    localStorage.removeItem('LoginId');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    this.router.navigate(['/login']);
  }
  
}

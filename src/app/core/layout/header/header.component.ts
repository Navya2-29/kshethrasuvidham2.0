import { Component, inject } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import { MenuComponent } from '../menu/menu.component';
import { AreaComponent } from '../../../features/Billing/area/area.component';
import {MatMenuModule} from '@angular/material/menu';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, MatSidenavModule, MatIconModule, MenuComponent, AreaComponent, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private router=inject(Router);
  showFiller = false;

  logout(){

    localStorage.setItem('loggedIn', 'false');
    this.router.navigate(['/login'])

  }
}

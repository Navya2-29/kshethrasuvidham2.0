import { Component } from '@angular/core';
import { LoginComponent } from '../auth/login/login.component';
import { HeaderComponent } from '../header/header.component';
import { MenuComponent } from '../menu/menu.component';
import { AreaComponent } from '../area/area.component';
import { FixedbottomComponent } from '../fixedbottom/fixedbottom.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LoginComponent, HeaderComponent, MenuComponent, AreaComponent, FixedbottomComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}

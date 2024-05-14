import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import { MenuComponent } from '../menu/menu.component';
import { AreaComponent } from '../area/area.component';
import {MatMenuModule} from '@angular/material/menu';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, MatSidenavModule, MatIconModule, MenuComponent, AreaComponent, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  showFiller = false;
}

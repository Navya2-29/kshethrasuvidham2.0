import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-vihidham-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,MatIconModule,MatButtonModule,MatInputModule],
  templateUrl: './vihidham-master.component.html',
  styleUrl: './vihidham-master.component.css'
})
export class VihidhamMasterComponent {

}

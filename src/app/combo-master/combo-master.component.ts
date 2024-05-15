import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-combo-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,MatIconModule,MatInputModule,FormsModule],
  templateUrl: './combo-master.component.html',
  styleUrl: './combo-master.component.css'
})
export class ComboMasterComponent {

}

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';

@Component({
  selector: 'app-specialday-master',
  standalone: true,
  imports: [MatIconModule,MatButtonModule,HeaderComponent,SpinnerComponent,],
  templateUrl: './specialday-master.component.html',
  styleUrl: './specialday-master.component.css'
})
export class SpecialdayMasterComponent {

}

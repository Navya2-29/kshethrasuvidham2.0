import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-member-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent,MatIconModule,MatButtonModule,],
  templateUrl: './member-master.component.html',
  styleUrl: './member-master.component.css'
})
export class MemberMasterComponent {

}

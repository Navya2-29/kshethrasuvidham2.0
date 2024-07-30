import { Component } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { MobserachcontentsComponent } from '../features/Billing/mobserachcontents/mobserachcontents.component';


@Component({
  selector: 'app-mobserachbtn',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MobserachcontentsComponent],
  templateUrl: './mobserachbtn.component.html',
  styleUrl: './mobserachbtn.component.css'
})
export class MobserachbtnComponent {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(MobserachcontentsComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}

import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon'

@Component({
  selector: 'app-multidayitems',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatTableModule, MatCheckboxModule,MatIconModule],
  templateUrl: './multidayitems.component.html',
  styleUrl: './multidayitems.component.css'
})
export class MultidayitemsComponent {

}

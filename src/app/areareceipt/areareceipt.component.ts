import {Component} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon'


import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MorebuttonComponent } from '../morebutton/morebutton.component';


//dt
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

import {MatRadioModule} from '@angular/material/radio';
import {MobserachbtnComponent} from '../mobserachbtn/mobserachbtn.component';

import { ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';

import { MultidayComponent } from '../multiday/multiday.component';




export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];


export interface vazhipad {
 name: string;
}





@Component({
  selector: 'app-areareceipt',
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule, MatInputModule, MatAutocompleteModule, FormsModule, ReactiveFormsModule, AsyncPipe, MatIconModule, MatRadioModule,MobserachbtnComponent,MultidayComponent, MorebuttonComponent],
  templateUrl: './areareceipt.component.html',
  styleUrl: './areareceipt.component.css'
})


export class AreareceiptComponent {

    //start data table
  displayedColumns: string[] = ['select', 'position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  
  // end data table

  vazhipadCtrl = new FormControl('');
 filteredvazhipad: Observable<vazhipad[]>;
  vazhipad: vazhipad[] = [
    {name: 'Pushpanjali'},
    {name: 'Abhishekam Pooja'},
    {name: 'Florida'},
    {name: 'Texas'},
  ];

  constructor() {
    this.filteredvazhipad = this.vazhipadCtrl.valueChanges.pipe(
      startWith(''),
      map(vazhipad => (vazhipad ? this._filtervazhipad(vazhipad) : this.vazhipad.slice())),
    );
  }

  private _filtervazhipad(value: string): vazhipad[] {
    const filterValue = value.toLowerCase();

    return this.vazhipad.filter(vazhipad => vazhipad.name.toLowerCase().includes(filterValue));
  }

 
}

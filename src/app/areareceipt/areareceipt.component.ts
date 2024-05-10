import {Component} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon'
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AsyncPipe, CommonModule} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MorebuttonComponent } from '../morebutton/morebutton.component';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatRadioModule} from '@angular/material/radio';
import {MobserachbtnComponent} from '../mobserachbtn/mobserachbtn.component';
import { MultidayComponent } from '../multiday/multiday.component';
export interface vazhipad {
 name: string;
}

@Component({
  selector: 'app-areareceipt',
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule,CommonModule, MatInputModule, MatAutocompleteModule, FormsModule, ReactiveFormsModule, AsyncPipe, MatIconModule, MatRadioModule,MobserachbtnComponent,MultidayComponent, MorebuttonComponent],
  templateUrl: './areareceipt.component.html',
  styleUrl: './areareceipt.component.css'
})

export class AreareceiptComponent {
  rows: any[] = [];
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
    this.addRow()
  }

    private _filtervazhipad(value: string): vazhipad[] {
    const filterValue = value.toLowerCase();
    return this.vazhipad.filter(vazhipad => vazhipad.name.toLowerCase().includes(filterValue));
  }

  addRow() {
    this.rows.unshift({});
  }
  deleteRow(index: number): void {
    this.rows.splice(index, 1);
  }
}

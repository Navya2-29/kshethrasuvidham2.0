import { Component } from '@angular/core';
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

export interface fname {
  //flag: string;
  name: string;
  //population: string;
}


@Component({
  selector: 'app-creditcollection',
  standalone: true,
  imports: [ MatCheckboxModule, MatInputModule, MatAutocompleteModule, FormsModule, ReactiveFormsModule, AsyncPipe, MatIconModule, MorebuttonComponent],
  templateUrl: './creditcollection.component.html',
  styleUrl: './creditcollection.component.css'
})
export class CreditcollectionComponent {

  fnameCtrl = new FormControl('');
 

  filteredfname: Observable<fname[]>;
 

  fname: fname[] = [
    { name: 'Mahesh'},
    { name: 'Namboothirippadu'},
    { name: 'Rajeev' },
    {  name: 'Sukumar' },
  ];


 

  constructor() {
    this.filteredfname = this.fnameCtrl.valueChanges.pipe(
      
      map(fname => (fname ? this._filterfname(fname) : this.fname.slice())),
    );
    
    
    
  }

  private _filterfname(value: string): fname[] {
    const filterValue = value.toLowerCase();

    return this.fname.filter(fname => fname.name.toLowerCase().includes(filterValue));
  }


}

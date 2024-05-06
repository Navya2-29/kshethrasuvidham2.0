import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {map, startWith} from 'rxjs/operators';


import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';

import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MorebuttonComponent } from '../morebutton/morebutton.component';




export interface vcat {
  name: string;
}

@Component({
  selector: 'app-vmaster',
  standalone: true,
  imports: [HeaderComponent, MatIconModule, RouterModule, MatSlideToggleModule, AsyncPipe, MatAutocompleteModule, FormsModule, ReactiveFormsModule, MatCheckboxModule, MatInputModule, MatAutocompleteModule, FormsModule, ReactiveFormsModule, AsyncPipe, MatIconModule, MorebuttonComponent, MatSelectModule],
  templateUrl: './vmaster.component.html',
  styleUrl: './vmaster.component.css'
})


export class VmasterComponent {
  toppings = new FormControl('');
  toppingList: string[] = ['Sree Padmanbha Swamy', 'Sree Narasimha Swamy', 'Sree Krishna Swamy', 'Sree Sastha', 'Sree Mahaganapathy', 'Sree Hanuman Swamy', 'Sree Padmanabha Swami','Veda Vyasar', 'Sreerama Swamy', 'Gaushala Donation'];


  vcatCtrl = new FormControl('');
 filteredvcat: Observable<vcat[]>;
 
 vcat: vcat[] = [
    { name: '101/1 Archanakal'},
    { name: '101/2 Poojakal'},
    { name: '101/3 Nivedyangal' },
    {  name: '101/4 Abhishekangal' },
  ];


 

  constructor() {
    this.filteredvcat = this.vcatCtrl.valueChanges.pipe(
      
      map(vcat => (vcat ? this._filtervcat(vcat) : this.vcat.slice())),
    );
    
    
    
  }

  private _filtervcat(value: string): vcat[] {
    const filterValue = value.toLowerCase();

    return this.vcat.filter(vcat => vcat.name.toLowerCase().includes(filterValue));
  }

}

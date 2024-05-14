import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { map, startWith } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MorebuttonComponent } from '../morebutton/morebutton.component';
import { vazhipad } from '../areareceipt/areareceipt.component';
import { Vmaster } from '../models/vmaster.model';
import { MasterService } from '../services/master/master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
export interface vcat {
  name: string;
}

@Component({
  selector: 'app-vmaster',
  standalone: true,
  imports: [HeaderComponent, MatIconModule, CommonModule, RouterModule, MatSlideToggleModule, AsyncPipe, MatAutocompleteModule, FormsModule, ReactiveFormsModule, MatCheckboxModule, MatInputModule, MatAutocompleteModule, FormsModule, ReactiveFormsModule, AsyncPipe, MatIconModule, MorebuttonComponent, MatSelectModule],
  templateUrl: './vmaster.component.html',
  styleUrl: './vmaster.component.css'
})


export class VmasterComponent implements OnInit {
  vmaster: Vmaster[] = [];
  filteredVmaster: Vmaster[] = [];
  showNoRecordsMessage: boolean = false;
  updateFlag: boolean = false;
  searchQuery: string = '';
  vazhipadForm: FormGroup;

  private masterService = inject(MasterService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);

  toppings = new FormControl('');
  toppingList: string[] = ['Sree Padmanbha Swamy', 'Sree Narasimha Swamy', 'Sree Krishna Swamy', 'Sree Sastha', 'Sree Mahaganapathy', 'Sree Hanuman Swamy', 'Sree Padmanabha Swami', 'Veda Vyasar', 'Sreerama Swamy', 'Gaushala Donation'];

  vcatCtrl = new FormControl('');
  filteredvcat: Observable<vcat[]>;

  vcat: vcat[] = [
    { name: '101/1 Archanakal' },
    { name: '101/2 Poojakal' },
    { name: '101/3 Nivedyangal' },
    { name: '101/4 Abhishekangal' },
  ];

  constructor() {
    this.filteredvcat = this.vcatCtrl.valueChanges.pipe(
      map(vcat => (vcat ? this._filtervcat(vcat) : this.vcat.slice())),
    );
  }

  ngOnInit(): void {
    this.vazhipadForm = this.formBuilder.group({
      vazhipadCode: ['', Validators.required],
      seasonalVazhipad: [false],
      vazhipadName: ['', Validators.required],
      vazhipadNameMalayalam: [''],
      vazhipadCategory: [''],
      vazhipadCategoryId: [''],
      prethishta: [''],
      rate: ['', Validators.required],
      noLimit: [''],
      timeLimit: [''],
      ticketMachine: [false],
      mobileApp: [false],
      allyQty: [false]
    });
    this.getVmaster();
  }
  private _filtervcat(value: string): vcat[] {
    const filterValue = value.toLowerCase();

    return this.vcat.filter(vcat => vcat.name.toLowerCase().includes(filterValue));
  }


  // view prathishta
  getVmaster() {
    this.masterService.getVmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // console.log(data)
          this.vmaster = data;
          this.filteredVmaster = this.vmaster
        }
      },
      error: (error) => {
        console.log(error);
      }
    });


  }

  // get pmaster form controls
  get pmasterFormFormControl() {
    return this.vazhipadForm.controls;
  }

  // submitt pmasterform
  onSubmit(data: Vmaster) {
    this.markFormGroupTouched(this.vazhipadForm);
    this.openSnackBar(" Prathishta Details created sussess fully", "close", "success-snackbar");
    this.masterService.createVmaster(data).subscribe({
      next: (res) => {
        console.log(res);
        this.onReset();
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
  // resetting form controls
  onReset() {
    this.vazhipadForm.reset();
    this.updateFlag = false;


  }

  //for editing the form fields
  onEdit(data: Vmaster) {
    console.log(data);
    this.updateFlag = true;
    this.vazhipadForm.patchValue({
      vazhipadCode: data.vazhipadCode,
      seasonalVazhipad: data.seasonalVazhipad,
      vazhipadName: data.vazhipadName,
      vazhipadNameMalayalam: data.vazhipadNameMalayalam,
      vazhipadCategory: data.vazhipadCategory,
      prethishta: data.prethishta,
      rate: data.rate,
      noLimit: data.noLimit,
      timeLimit: data.timeLimit,
      ticketMachine: data.ticketMachine,
      mobileApp: data.mobileApp,
      allyQty: data.allyQty
    });
  }

  //update data
  onUpdate(updatedata: Vmaster) {
    console.log(updatedata);
    this.openSnackBar(" vazhipad Details updated sussess fully", "close", "success-snackbar");
    let id: string = '';
    this.masterService.updateVmaster(id, updatedata).subscribe((res) => {
      console.log(res)
    })
  }
  // deleteData
  onDelete(id: string) {
    this.openSnackBar(" vazipad Details deleted sussess fully", "close", "success-snackbar");
    this.masterService.delete(id).subscribe((res) => {
      console.log(res);
    })
  }

  // search functionality by pname
  onSearch(searchQuery: string) {
    if (!this.searchQuery.trim()) {
      this.filteredVmaster = this.vmaster;
    }

    else {
      this.filteredVmaster = this.vmaster.filter((data) => {
        console.log(data)
        return data.vazhipadName.toLowerCase().includes(this.searchQuery);
      });
    }
  }

  // snack  message
  openSnackBar(message: string, action: string, classname: string) {
    this._snackBar.open(message, action, {
      panelClass: classname,
      horizontalPosition: "end",
      verticalPosition: "top",
    });
  }

// validation
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}

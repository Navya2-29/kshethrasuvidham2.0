import { Component, Inject, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {map, startWith} from 'rxjs/operators';
import {AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {AsyncPipe, CommonModule} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MorebuttonComponent } from '../morebutton/morebutton.component';
import { MasterService } from '../services/master/master.service';
import { Pmaster } from '../models/pmaster.model';
import { Vmaster } from '../models/vmaster.model';
import { DuplicatecheckService } from '../services/duplicateCheckValidator/duplicatecheck.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface vcat {
  name: string;
}

@Component({
  selector: 'app-vmaster',
  standalone: true,
  imports: [HeaderComponent, MatIconModule,CommonModule,ReactiveFormsModule, RouterModule, MatSlideToggleModule, AsyncPipe, MatAutocompleteModule, FormsModule, ReactiveFormsModule, MatCheckboxModule, MatInputModule, MatAutocompleteModule, FormsModule, ReactiveFormsModule, AsyncPipe, MatIconModule, MorebuttonComponent, MatSelectModule],
  templateUrl: './vmaster.component.html',
  styleUrl: './vmaster.component.css'
})


export class VmasterComponent implements OnInit{
  vazhipadMasterForm: FormGroup;
  vamaster:Vmaster[]=[];
  toppings = new FormControl('');
  toppingList: string[] = [];
  vcatCtrl = new FormControl('');
 filteredvcat: Observable<vcat[]>;
 updateFlag: boolean = false;
  searchQuery: string = '';
  loading:boolean=false;
 vcat: vcat[] = [
    { name: '101/1 Archanakal'},
    { name: '101/2 Poojakal'},
    { name: '101/3 Nivedyangal' },
    {  name: '101/4 Abhishekangal' },
  ];

private formBuilder=inject(FormBuilder);
private masterService=inject(MasterService);
private duplicateCheck=inject(DuplicatecheckService)
private _snackBar = inject(MatSnackBar);
constructor() {
    this.filteredvcat = this.vcatCtrl.valueChanges.pipe(
      
      map(vcat => (vcat ? this._filtervcat(vcat) : this.vcat.slice())),
    );
    
    // vazhipad master form model
    
    
  }

  ngOnInit(): void {
    this.vazhipadMasterForm = this.formBuilder.group({
      code: ['', [
        Validators.required,
        Validators.maxLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$'),
        // this.duplicateCodeValidator.bind(this)
      ]],
      
      name: ['', [Validators.required,
        Validators.pattern('^[a-zA-Z\s]+$'),
        Validators.maxLength(3)
        // this.duplicateNameValidator.bind(this)
        ]],
      nameMalayalam: ['', Validators.required],
      category: ['', Validators.required],
      prathishta: [[], Validators.required],
      rate: ['', Validators.required],
      limit: ['', Validators.required],
      timeLimit: ['',Validators.required],
      ticketMachine: ['false',Validators.required],
      mobileApp: ['false',Validators.required],
      allwQty: ['false',Validators.required],
      seasonal: ['false',Validators.required]
    });
    this.loadPmasterNames();
  }
  // get pmaster form controls
  get vmasterFormControl() {
    return this.vazhipadMasterForm.controls;
  }
  // auto complete of category
  private _filtervcat(value: string): vcat[] {
    const filterValue = value.toLowerCase();

    return this.vcat.filter(vcat => vcat.name.toLowerCase().includes(filterValue));
  }

// onsubmit
onSubmit(data: any) {
  // console.log(data.PM_Code,data.PM_NameEng,this.selectedFile.name);
  //     const formData = new FormData();
  //     formData.append('PM_Code', data.PM_Code);
  //     formData.append('PM_NameEng',data.PM_NameEng);
  //     formData.append('PM_Name',data.PM_Name);
  //     formData.append('imgurl', this.selectedFile.name);
  //      console.log(formData);
  // this.openSnackBar(" Prathishta Details created sussess fully", "close","success-snackbar");

  // const obj = this.pmasterForm.value;
  this.loading=true;
  if (this.vazhipadMasterForm.valid) {
    this.masterService.createPmaster(data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading=false;
        this.openSnackBar(" Prathishta Details created sussess fully", "close", "success-snackbar");

        this.onReset();
      },
      error: (error) => {
        this.loading=true;
        console.log(error);
      }
    })
  }
  else {
    this.markFormGroupTouched(this.vazhipadMasterForm);
  }
}

openSnackBar(message: string, action: string, classname: string) {
  this._snackBar.open(message, action, {
    panelClass: classname,
    horizontalPosition: "end",
    verticalPosition: "top",
  });
}
  // prathishta name on dropdown list
  loadPmasterNames() {
    this.masterService.getPmaster().subscribe({
     next: (pmasters: Pmaster[]) => {
      console.log(pmasters);
        // Extracting only the names from pmasters and assigning to pmasterNames
        this.toppingList = pmasters.map(pmaster => pmaster.PM_NameEng);
        console.log(this.toppingList)
      },
     error: (error:any) => {
        console.error('Error loading pmaster names: ', error);
      }
    }
  );
  }

  onSearch(searchQuery: string){

  }
  onUpdate(data:any){

  }
  onReset() {
    this.loading=true;
    this.vazhipadMasterForm.reset();
    this.updateFlag = false;
    this.loading=false;
    this.ngOnInit();

  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  // duplicateCodeValidator(control: AbstractControl): ValidationErrors | null {
  //   const code = control.value;
  //   if (this.duplicateCheck.vmastercheckDuplicateCode(code,this.vamaster)) {
  //     return { duplicateCode: true };
  //   }
  //   return null;
  // }
   
  // duplicate name check validators
  // duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
  //   const name = control.value;
  //   if (this.duplicateCheck.checkDuplicateName(name, this.vmaster)) {
  //     return { duplicateName: true };
  //   }
  //   return null;
  // }
 
}

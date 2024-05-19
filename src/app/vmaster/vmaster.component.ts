import { Component, OnInit, inject } from '@angular/core';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HeaderComponent } from '../header/header.component';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable, map, startWith } from 'rxjs';
import { MasterService } from '../services/master/master.service';
import { Vmaster } from '../models/vmaster.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DuplicatecheckService } from '../services/duplicateCheckValidator/duplicatecheck.service';
import { UpperCaseDirective } from '../shared/directives/upper-case.directive';

@Component({
  selector: 'app-vmaster',
  standalone: true,
  imports: [HeaderComponent, SpinnerComponent, MatIconModule, MatInputModule,
    FormsModule, ReactiveFormsModule, CommonModule, MatAutocompleteModule,
    MatCheckboxModule,UpperCaseDirective],
  templateUrl: './vmaster.component.html',
  styleUrl: './vmaster.component.css'
})


export class VmasterComponent implements OnInit {
  Vmaster:Vmaster[]=[];
  filteredVmaster:Vmaster[]=[];
  vazhipadMasterForm: FormGroup;
  category: string[] = [];
  accountHead: string[] = [];
  accountSubHead: string[] = [];
  filteredAccountHead: Observable<string[]>;
  filteredCategory: Observable<string[]>;
  filteredAccountSubHead: Observable<string[]>;
  loading:boolean=false;
  updateFlag:boolean=false;
  Id:number;
  searchQuery:string='';
  showNoRecordsMessage:boolean = false;
  private formBuilder = inject(FormBuilder);
  private masterService = inject(MasterService);
  private _snackBar=inject(MatSnackBar);
  private duplicateCheck=inject(DuplicatecheckService);
  constructor() {
    this.vazhipadMasterForm = this.formBuilder.group({
      VM_Code: ['',[Validators.required,
        Validators.maxLength(10),
        Validators.pattern('^[a-zA-Z0-9]+$'),
        
        this.duplicateCodeValidator.bind(this)
      ]],
      VM_Name: ['',[Validators.required,
        Validators.pattern('^[a-zA-Z\s]+$'),
        Validators.maxLength(100),
        this.duplicateNameValidator.bind(this)]],
      VM_RName: ['',[Validators.required]],
      VM_Amt: [0,[Validators.required]],
      VM_MaxNo: [0,[Validators.required]],
      VM_Receipt: [false],
      VM_Booking: [false],
      VM_Blocking: [false],
      VM_SeaSonal: [false],
      VM_MultiName: [false],
      VM_Device: [false],
      VM_Mobileapp: [false],
      VM_Special: [false],
      VM_Rate_Change: [false],
      VM_Sms: [false],
      VM_TimeLimit: [0],
      VM_DeScription: [''],
      VM_AlertMSg: [''],
      VM_Online: [false],
      VM_Active: [false],
      // DiSplayMode: [''],
      ACHeadCode: ['',],
      ACSubCode: ['',],
      VC_Name: ['',[Validators.required]],
      VP_Name: [[],[Validators.required]],
      VM_Watsapp: ['']
    })


  }

  ngOnInit(): void {
    this.loading=true;
    // filter for autocompleate category
    this.filteredCategory = this.vazhipadMasterForm.get('VC_Name')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCategory(value || '')),
    );
    this.getCategory();
    // get auto compleate account sub head
    this.filteredAccountHead = this.vazhipadMasterForm.get('ACHeadCode')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterAccountHead(value || '')),
    );
    // get auto compleate account sub head
    this.getAccountHead();
    this.filteredAccountSubHead = this.vazhipadMasterForm.get('ACSubCode')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterAccountSubHead(value || '')),
    );

    this.getAccountSubHead();
    this.getVmaster()
  }
  // filtering for acountHead to compleate auto complete
  private _filterAccountHead(value: string): string[] {
    const accountHead = value.toLowerCase();

    return this.accountHead.filter(option => option.toLowerCase().includes(accountHead));
  }
  // filtering for category to compleate auto complete

  private _filterCategory(value: string): string[] {
    const category = value.toLowerCase();

    return this.category.filter(option => option.toLowerCase().includes(category));
  }
  // filtering for acount sub Head to compleate auto complete

  private _filterAccountSubHead(value: string): string[] {
    const subHead = value.toLowerCase();

    return this.accountSubHead.filter(suhead => suhead.toLowerCase().includes(subHead));
  }

  // get All category 

  getCategory() {
    this.masterService.getVmasterCategory().subscribe({
      next: (cmasters) => {

        this.category = cmasters.map(cmaster => cmaster.CM_NameEng);
        console.log(this.category)
      }
    })
  }

  // getAccountHead
  getAccountHead() {
    this.masterService.getAccountHeads().subscribe({
      next: (accountHead) => {

        this.accountHead = accountHead.map(head => head.name);
        console.log(this.accountHead)
      }
    })
  }

  // getAccountSubHead
  getAccountSubHead() {
    this.masterService.getSubAccountHeads().subscribe({
      next: (accountSubHead) => {

        this.accountSubHead = accountSubHead.map(subhead => subhead.name);
        console.log(this.accountHead)
      }
    })
  }

// get vmaster
getVmaster(){
  this.loading=false;
  this.masterService.getVmaster().subscribe({
    next:(data)=>{
      if (data && data.length > 0) {
         console.log(data)
        this.Vmaster = data;
        this.filteredVmaster = this.Vmaster;
        this.loading=false;
      }
    },
    error: (error) => {
      console.log(error);
      this.loading=true;
    }
  });
}
// get vmaster form controls
get vmasterFormControl() {
  return this.vazhipadMasterForm.controls;
}


  // submit form
  onSubmit(data: Vmaster) {
    console.log(data);
    this.loading=true;
    if (this.vazhipadMasterForm.valid) {
      this.masterService.createVmaster(data).subscribe({
        next: (res) => {
          console.log(res);
          this.loading=false;
          this.openSnackBar("Vazhpad  Details created sussess fully", "close", "success-snackbar");

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
  // resetting form controls
  onReset() {
    this.loading=true;
    this.vazhipadMasterForm.reset();
    this.updateFlag = false;
    this.loading=false;

  }
  //for editing the form fields
  onEdit(data: Vmaster) {
    this.loading=true;
    console.log(data);
    this.updateFlag = true;
    this.Id = data.id;
    this.vazhipadMasterForm.patchValue({
      VM_Code: data.VM_Code,
      VM_Name: data.VM_Name,
      VM_RName: data.VM_RName,
      VM_Amt: data.VM_Amt,
      VM_MaxNo: data.VM_MaxNo,
      VM_Receipt: data.VM_Receipt,
      VM_Booking: data.VM_Booking,
      VM_Blocking: data.VM_Blocking,
      VM_SeaSonal: data.VM_SeaSonal,
      VM_MultiName: data.VM_MultiName,
      VM_Device: data.VM_Device,
      VM_Mobileapp: data.VM_Mobileapp,
      VM_Special: data.VM_Special,
      VM_Rate_Change:data.VM_Rate_Change,
      VM_Sms: data.VM_Sms,
      VM_TimeLimit: data.VM_TimeLimit,
      VM_DeScription:data.VM_DeScription,
      VM_AlertMSg: data.VM_AlertMSg,
      VM_Online:data.VM_Online,
      VM_Active: data.VM_Active,
      // DiSplayMode: [''],
      ACHeadCode: data.ACHeadCode,
      ACSubCode: data.ACSubCode,
      VC_Name: data.VC_Name,
      VP_Name: data.VP_Name,
      VM_Watsapp: data.VM_Watsapp
    });
    this.loading=false;
  }

   //update data
   onUpdate(updatedata: Vmaster) {
    this.loading=true;
    console.log(updatedata, this.Id);
    this.masterService.updateVmaster(this.Id, updatedata).subscribe((res) => {
      this.loading=false;
      this.openSnackBar(" vazhipad Details updated sussess fully", "close", "success-snackbar");
      console.log(res)
    })
  }
   // deleteData
   onDelete(id: string) {
    this.loading=true;
    this.masterService.deleteVmaster(id).subscribe((res) => {
      console.log(res);
      this.loading=false;
      this.openSnackBar(" Vazhipad Details deleted sussess fully", "close", "success-snackbar");
    })
  }
   // search functionality by name and code
   onSearch(searchQuery: string) {
    
    if (!this.searchQuery.trim()) {
      this.filteredVmaster = this.Vmaster;
    }

    else {
      this.filteredVmaster = this.Vmaster.filter((data) => {
        console.log(data)
        return data.VP_Name.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
      
    }
    this.showNoRecordsMessage=this.filteredVmaster.length===0
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

  // duplicate code check validators
  duplicateCodeValidator(control: AbstractControl): ValidationErrors | null {
    const code = control.value;
    if (this.duplicateCheck.vmastercheckDuplicateCode(code,this.Vmaster)) {
      return { duplicateCode: true };
    }
    return null;
  }
   
  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    if (this.duplicateCheck.vmastercheckDuplicateName(name, this.Vmaster)) {
      return { duplicateName: true };
    }
    return null;
  }



}

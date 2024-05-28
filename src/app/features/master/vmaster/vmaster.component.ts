import { Component, OnInit, inject } from '@angular/core';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HeaderComponent } from '../../../header/header.component';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable, map, startWith } from 'rxjs';
import { MasterService } from '../../../services/master/master.service';
import { VcList, Vmaster } from '../../../models/vmaster.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-vmaster',
  standalone: true,
  imports: [HeaderComponent, SpinnerComponent, MatIconModule, MatInputModule,
    FormsModule, ReactiveFormsModule, CommonModule, MatAutocompleteModule,
    MatCheckboxModule, UpperCaseDirective],
  templateUrl: './vmaster.component.html',
  styleUrl: './vmaster.component.css'
})

export class VmasterComponent implements OnInit {
  Vmaster: Vmaster[] = [];
  filteredVmaster: Vmaster[] = [];
  vazhipadMasterForm: FormGroup;
  category: VcList[] = [];
  accountHead: string[] = [];
  accountSubHead: string[] = [];
  filteredAccountHead: Observable<string[]>;
  filteredCategory: Observable<VcList[]>;
  filteredAccountSubHead: Observable<string[]>;
  loading: boolean = false;
  updateFlag: boolean = false;
  Id: number;
  searchQuery: string = '';
  showNoRecordsMessage: boolean = false;
  private formBuilder = inject(FormBuilder);
  private masterService = inject(MasterService);
  private _snackBar = inject(MatSnackBar);
  private duplicateCheck = inject(DuplicatecheckService);

  
  constructor(private http: HttpClient) {
    this.vazhipadMasterForm = this.formBuilder.group({
      VM_Code: ['', [Validators.required,
      Validators.maxLength(10),
      Validators.pattern('^[a-zA-Z0-9]+$'),
      this.duplicateCodeValidator.bind(this)
      ]],
      VM_Name: ['', [Validators.required,
      Validators.pattern('^[a-zA-Z\s]+$'),
      Validators.maxLength(100),
      this.duplicateNameValidator.bind(this)]],
      VM_RName: ['', [Validators.required]],
      VM_Amt: [0, [Validators.required]],
      VM_MaxNo: [0, [Validators.required]],
      VM_Receipt: [false],
      VM_Booking: [false],
      VM_Blocking: [false],
      VM_Seasonal: [false],
      VM_MultiName: [false],
      VM_Device: [false],
      VM_Mobileapp: [false],
      VM_Special: [false],
      VM_Rate_Change: [false],
      SMS: [false],
      VM_TimeLimit: [0],
      VM_Description: [''],
      VM_AlertMsg: [''],
      // VM_Online: [false],
      VM_Active: [true],
      DisplayMode: [false],
      ACHeadCode: ['',],
      ACSubCode: ['',],
      VC_Name: ['', [Validators.required]],
      // VP_Name: [[],[Validators.required]],
      Whatsapp: [''],
      VM_Time: ['']
    })
  }


  ngOnInit(): void {
    // this.Addvazhpads();
    this.loading = true;
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
    // this.getAccountHead();
    this.filteredAccountSubHead = this.vazhipadMasterForm.get('ACSubCode')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterAccountSubHead(value || '')),
    );

    // this.getAccountSubHead();
    this.getVmaster()
  }
  // filtering for acountHead to compleate auto complete
  private _filterAccountHead(value: string): string[] {
    const accountHead = value.toLowerCase();

    return this.accountHead?.filter(option => option.toLowerCase().includes(accountHead));
  }
  // filtering for category to compleate auto complete

  private _filterCategory(value: string): VcList[] {
    const category = value.toLowerCase();

    return this.category.filter(option => option.VC_Name.toLowerCase().includes(category));
  }
  // filtering for acount sub Head to compleate auto complete

  private _filterAccountSubHead(value: string): string[] {
    const subHead = value.toLowerCase();
    return this.accountSubHead.filter(suhead => suhead.toLowerCase().includes(subHead));
  }


  // get All category 

  getCategory() {
    this.masterService.getCmaster().subscribe({
      next: (cmasters) => {
        this.category = cmasters.map(item => ({
          VC_Id: item.VC_ID,
          VC_Name: item.VC_Name
        }));
        console.log(this.category)
      }
    })
  }

  // getAccountHead
  // getAccountHead() {
  //   this.masterService.getAccountHeads().subscribe({
  //     next: (accountHead) => {

  //       this.accountHead = accountHead.map(head => head.name);
  //       console.log(this.accountHead)
  //     }
  //   })
  // }

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
  getVmaster() {
    this.loading = true;
    const payLoad = { "Type": "vazhipadALL", "Code": "" }
    this.masterService.getVmaster(payLoad).subscribe({
      next: (data) =>{
        if (data && data.length > 0) {
          console.log(data)
          this.Vmaster = data;
          this.filteredVmaster = this.Vmaster;
          this.loading = false;
        }
      },
      error: (error) => {
        console.log(error);
        this.loading = true;
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
    console.log("data")
    this.loading = true;

    if (this.vazhipadMasterForm.valid) {
      const formValue=this.vazhipadMasterForm.value;
      const selectedVc =  this.category.find(vc => vc.VC_Name === formValue.VC_Name);
      // console.log(formValue);
      // console.log(JSON.stringify(selectedVc)+"daaaaaaaaaaaaa");
      if(selectedVc){
        const VCId=selectedVc.VC_Id;
        this.masterService.createVmaster(VCId,data).subscribe({
          next: (res) => {
            // console.log(res);
            this.loading = false;
            this.openSnackBar("Vazhpad  Details created sussess fully", "close", "success-snackbar");
            this.getVmaster();
            this.onReset();
          },
          error: (error) => {
            this.loading = true;
            console.log(error);
          }
        })
      }
     
    }
    else {
      this.markFormGroupTouched(this.vazhipadMasterForm);
    }
  }

  // resetting form controls
  onReset() {
    this.loading = true;
    this.vazhipadMasterForm.reset({
      VM_Active: true,
    });
    this.updateFlag = false;
    this.loading = false;
  }


  // for editing the form fields
  onEdit(data: Vmaster) {
    this.Id=data.VM_Id;
    this.loading = true;
    // console.log(data);
    this.updateFlag = true;
    const id=data.VC_ID.toString()
    // console.log(this.category)
    const selectedVc =  this.category.find(vc => vc.VC_Id == id);
    // console.log(id,selectedVc)
    const VCName= selectedVc?.VC_Name;
    // console.log(VCName)
   this.vazhipadMasterForm.patchValue({
      VM_Code: data.VM_Code,
      VM_Name: data.VM_Name,
      VM_RName: data.VM_RName,
      VM_Amt: data.VM_Amt,
      VM_MaxNo: data.VM_MaxNo,
      VM_Receipt: data.VM_Receipt=="Y"?true:false,
      VM_Booking: data.VM_Booking=="Y"?true:false,
      VM_Blocking: data.VM_Blocking=="Y"?true:false,
      VM_Seasonal: data.VM_Seasonal=="Y"?true:false,
      VM_MultiName: data.VM_MultiName=="Y"?true:false,
      VM_Device: data.VM_Device=="Y"?true:false,
      VM_Mobileapp: data.VM_Mobileapp=="Y"?true:false,
      VM_Special: data.VM_Special=="Y"?true:false,
      VM_Rate_Change: data.VM_Rate_Change=="Y"?true:false,
      VM_TimeLimit: data.VM_TimeLimit,
      VM_Description: data.VM_Description,
      VM_AlertMsg: data.VM_AlertMsg,
      DisplayMode: data.DisplayMode=="Y"?true:false,
      VM_Active: data.VM_Active=="Y"?true:false,
      ACHeadCode: data.ACHeadCode,
      ACSubCode: data.ACSubCode,
      VC_Name: VCName
    });
   
    this.loading = false;
    
  }

  //update data
  onUpdate(updatedata: Vmaster) {
    console.log(updatedata);
    this.loading = true;
    console.log(updatedata, this.Id);
    if (this.vazhipadMasterForm.valid) {
      const formValue=this.vazhipadMasterForm.value;
      const selectedVc =  this.category.find(vc => vc.VC_Name === formValue.VC_Name);
      console.log(formValue);
      console.log(JSON.stringify(selectedVc)+"daaaaaaaaaaaaa");
      if(selectedVc){
        const VCId=selectedVc.VC_Id;
        this.masterService.updateVmaster(VCId,updatedata,this.Id).subscribe({
          next: (res) => {
            console.log(res);
            this.loading = false;
            this.openSnackBar("Vazhpad  Details created sussess fully", "close", "success-snackbar");
            this.onReset();
          },
          error: (error) => {
            this.loading = true;
            console.log(error);
          }
        })
      }
    }
    else {
      this.markFormGroupTouched(this.vazhipadMasterForm);
    }
  }
  // deleteData
  onDelete(id: number) {
    this.loading = true;
    const Id=id+''
    this.masterService.deleteVmaster(Id).subscribe((res) => {
      console.log(res);
      this.loading = false;
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
        return data.VM_Name.toLowerCase().includes(this.searchQuery.toLowerCase());
      });

    }
    this.showNoRecordsMessage = this.filteredVmaster.length === 0
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
    if (this.duplicateCheck.vmastercheckDuplicateCode(code, this.Vmaster)) {
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





  getVazhipadinfo() {

    const reqBody = { "Type": "vazhipadALL", "Code": "" }

    this.http.post('http://api.suvidham.in/api/KshetramAPI/ViewMasters', reqBody).subscribe({
      next: (res) => {
        console.log(res)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  Addvazhpads() {
    const reqBody = {
      "vazhId": "", "VazhCode": "admin", "VazhName": "bbb", "VazhRName": "admin", "VazhAmt": "100", "VazhMaxNo": "1", "VazhReceipt": "Y", "VazhBooking": "Y",
      "VazhSeasonal": "Y", "VazhMultiName": "Y", "VMDevice": "Y", "VMapp": "Y", "VMspecial": "Y", "VMRatechange": "Y", "VazhTime": "bbb", "VazhTimeLimit": "10",
      "VMDescription": "1", "VMAlert": "admin", "Active": "Y", "VCatId": "1", "ACHeadCode": "bbb", "ACSubCode": "admin", "Cuser": "1", "VazhBlocking": "Y", "Type": "INSERT", "DisplayMode": "1"
    }


    this.http.post('http://api.suvidham.in/api/KshetramAPI/AddVazhipadMaster', reqBody).subscribe({
      next: (res) => {
        console.log(res)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  updatevazhpads() {
    const reqBody = {
      "vazhId": "", "VazhCode": "admin", "VazhName": "bbb", "VazhRName": "admin", "VazhAmt": "100", "VazhMaxNo": "1", "VazhReceipt": "Y", "VazhBooking": "Y",
      "VazhSeasonal": "Y", "VazhMultiName": "Y", "VMDevice": "Y", "VMapp": "Y", "VMspecial": "Y", "VMRatechange": "Y", "VazhTime": "bbb", "VazhTimeLimit": "10",
      "VMDescription": "1", "VMAlert": "admin", "Active": "Y", "VCatId": "1", "ACHeadCode": "bbb", "ACSubCode": "admin", "Cuser": "1", "VazhBlocking": "Y", "Type": "UPDATE", "DisplayMode": "1"
    }


    this.http.post('http://api.suvidham.in/api/KshetramAPI/AddVazhipadMaster', reqBody).subscribe({
      next: (res) => {
        console.log(res)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  deletevazhpads() {
    const reqBody = { "Type": "vazhipad", "Id": "2" }

    this.http.post('http://api.suvidham.in/api/KshetramAPI/DeleteMasters', reqBody).subscribe({
      next: (res) => {
        console.log(res)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

}

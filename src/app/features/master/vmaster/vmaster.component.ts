import { Component, OnInit, inject } from '@angular/core';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable, map, startWith } from 'rxjs';
import { MasterService } from '../../../services/master/master.service';
import { VcList, Vmaster } from '../../../models/vmaster.model';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';
import { NotificationService } from '../../../services/notification/notification.service';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-vmaster',
  standalone: true,
  imports: [
    HeaderComponent,
    SpinnerComponent,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    UpperCaseDirective,
    MatSelectModule,
  ],
  templateUrl: './vmaster.component.html',
  styleUrl: './vmaster.component.css',
})
export class VmasterComponent implements OnInit {
  toppings = new FormControl('');
  toppingList: string[] = [
    'Extra cheese',
    'Mushroom',
    'Onion',
    'Pepperoni',
    'Sausage',
    'Tomato',
  ];
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
  deities: any[];
  code: string;
  showNoRecordsMessage: boolean = false;
  private formBuilder = inject(FormBuilder);
  private masterService = inject(MasterService);
  private duplicateCheck = inject(DuplicatecheckService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  sortAscending: boolean = true;
  constructor() {
    this.vazhipadMasterForm = this.formBuilder.group({
      VM_Code: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern('^[a-zA-Z0-9]+$'),
          this.duplicateCodeValidator.bind(this),
        ],
      ],
      VM_Name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9/()\\-\\s]+$'),
          this.duplicateNameValidator.bind(this),
        ],
      ],
      VM_RName: [
        '',
        [Validators.required, this.duplicateRegionalNameValidator.bind(this)],
      ],
      VM_Amt: [0, [Validators.required, Validators.pattern('^[0-9][0-9]*$')]],
      VM_MaxNo: [0, [Validators.pattern('^[0-9][0-9]*$')]],
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
      VM_TimeLimit: [0, [Validators.pattern('^[0-9][0-9]*$')]],
      VM_Description: [''],
      VM_AlertMsg: [''],
      VM_Active: [true],
      DisplayMode: [false],
      ACHeadCode: [''],
      ACSubCode: [''],
      VC_Name: ['', [Validators.required]],
      Whatsapp: [''],
      VM_Time: ['1'],
      //  deities: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.getVmaster();
    this.getCategory();
    this.fetchDeities();
    // filter for autocompleate category
    this.filteredCategory = this.vazhipadMasterForm
      .get('VC_Name')!
      .valueChanges.pipe(
        startWith(''),
        map((value) => this._filterCategory(value || ''))
      );
  }

  // filtering for category to compleate auto complete
  private _filterCategory(value: string): VcList[] {
    const category = value.toLowerCase();
    return this.category.filter((option) =>
      option.VC_Name.toLowerCase().includes(category)
    );
  }

  // get All category
  getCategory() {
    this.loading = true;
    this.masterService.getCmaster().subscribe({
      next: (cmasters) => {
        this.category = cmasters.map((item) => ({
          VC_Id: item.VC_ID,
          VC_Name: item.VC_Name,
        }));
        this.loading = false;
      },
    });
  }

  // get vmaster
  getVmaster() {
    this.loading = true;
    this.masterService.getVmaster().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          console.log(data);
          this.Vmaster = data;
          console.log(this.Vmaster);
          this.filteredVmaster = this.Vmaster;
          this.sortByVMCode();
          this.loading = false;
        }
      },
      error: (error) => {
        this.notification.showSuccess('Try after some Time');
      },
    });
  }
  sortByVMCode() {
    this.Vmaster.sort((a, b) => {
      const codeA = parseInt(a.VM_Code, 10);
      const codeB = parseInt(b.VM_Code, 10);

      if (isNaN(codeA)) return 1; // Consider NaN as the highest value if sorting
      if (isNaN(codeB)) return -1;

      return this.sortAscending ? codeA - codeB : codeB - codeA;
    });
  }
  // get vmaster form controls
  get vmasterFormControl() {
    return this.vazhipadMasterForm.controls;
  }

  // submit form
  onSubmit(data: Vmaster) {
    console.log(data);
    if (this.vazhipadMasterForm.valid) {
      this.loading = true;
      const formValue = this.vazhipadMasterForm.value;
      const selectedVc = this.category.find(
        (vc) => vc.VC_Name === formValue.VC_Name
      );
      console.log(selectedVc);
      if (selectedVc) {
        const VCId = selectedVc.VC_Id;
        this.masterService.createVmaster(VCId, data).subscribe({
          next: (res) => {
            console.log(res);
            if (res.RespStatus === 'I') {
              this.loading = false;

              this.getVmaster();
              this.onReset();
              this.notification.showSuccess(
                'vazhipad details added successfully'
              );
            }
          },
          error: (error) => {
            this.loading = true;
            console.log(error);
          },
        });
      }
    } else {
      this.markFormGroupTouched(this.vazhipadMasterForm);
      this.notification.showSuccess('Please Fill the Details');
    }
  }

  // resetting form controls
  onReset() {
    this.vazhipadMasterForm.reset({
      VM_Active: true,
      VM_Code: '',
      VM_Name: '',
      VM_RName: '',
      VM_Amt: 0,
      VM_MaxNo: 0,
      VM_Receipt: false,
      VM_Booking: false,
      VM_Blocking: false,
      VM_Seasonal: false,
      VM_MultiName: false,
      VM_Device: false,
      VM_Mobileapp: false,
      VM_Special: false,
      VM_Rate_Change: false,
      SMS: false,
      VM_TimeLimit: 0,
      VM_Description: '',
      VM_AlertMsg: '',

      DisplayMode: false,
      ACHeadCode: '',
      ACSubCode: '',
      VC_Name: '',
      Whatsapp: '',
      VM_Time: '1',
    });
    this.updateFlag = false;
    this.loading = false;
  }

  // for editing the form fields
  onEdit(data: Vmaster) {
    this.Id = data.VM_Id;
    this.loading = true;
    this.updateFlag = true;
    this.code = data.VM_Code;
    const id = data.VC_ID.toString();
    const selectedVc = this.category.find((vc) => vc.VC_Id == id);
    const VCName = selectedVc?.VC_Name;
    this.vazhipadMasterForm.patchValue({
      VM_Code: data.VM_Code,
      VM_Name: data.VM_Name,
      VM_RName: data.VM_RName,
      VM_Amt: data.VM_Amt,
      VM_MaxNo: data.VM_MaxNo,
      VM_Receipt: data.VM_Receipt == 'Y' ? true : false,
      VM_Booking: data.VM_Booking == 'Y' ? true : false,
      VM_Blocking: data.VM_Blocking == 'Y' ? true : false,
      VM_Seasonal: data.VM_Seasonal == 'Y' ? true : false,
      VM_MultiName: data.VM_MultiName == 'Y' ? true : false,
      VM_Device: data.VM_Device == 'Y' ? true : false,
      VM_Mobileapp: data.VM_Mobileapp == 'Y' ? true : false,
      VM_Special: data.VM_Special == 'Y' ? true : false,
      VM_Rate_Change: data.VM_Rate_Change == 'Y' ? true : false,
      VM_TimeLimit: data.VM_TimeLimit,
      VM_Description: data.VM_Description,
      VM_AlertMsg: data.VM_AlertMsg,
      DisplayMode: data.DisplayMode == 'Y' ? true : false,
      VM_Active: data.VM_Active == 'Y' ? true : false,
      ACHeadCode: data.ACHeadCode,
      ACSubCode: data.ACSubCode,
      VC_Name: VCName,
      VM_Time: data.VM_Time,
    });

    this.loading = false;
  }

  //update data
  onUpdate(updatedata: Vmaster) {
    console.log(updatedata);
    this.loading = true;
    // console.log(updatedata, this.Id);
    if (this.vazhipadMasterForm.valid) {
      const formValue = this.vazhipadMasterForm.value;
      const selectedVc = this.category.find(
        (vc) => vc.VC_Name === formValue.VC_Name
      );

      if (selectedVc) {
        const VCId = selectedVc.VC_Id;
        this.masterService.updateVmaster(VCId, updatedata, this.Id).subscribe({
          next: (res) => {
            this.getVmaster();
            this.loading = false;

            this.onReset();
            this.notification.showSuccess(
              'Vazhipad details updated suceesfully'
            );
          },
          error: (error) => {
            this.loading = true;
            this.notification.showSuccess(error);
          },
        });
      }
    } else {
      this.markFormGroupTouched(this.vazhipadMasterForm);
      this.notification.showSuccess('please fill the details');
    }
  }
  // deleteData
  onDelete(id: number) {
    this.loading = true;
    const Id = id + '';
    this.masterService.deleteVmaster(Id).subscribe((res) => {
      this.loading = false;
      this.getVmaster();
      this.notification.showSuccess(' Vazhipad Details deleted successfully');
    });
  }
  // search functionality by name and code
  onSearch(searchQuery: string) {
    if (!this.searchQuery.trim()) {
      this.filteredVmaster = this.Vmaster;
    } else {
      this.filteredVmaster = this.Vmaster.filter((data) => {
        console.log(data);
        return (
          data.VM_Name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          data.VM_Code.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    }
    this.showNoRecordsMessage = this.filteredVmaster.length === 0;
  }
  // validation
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
        this.loading = false;
      }
    });
  }

  // duplicate code check validators
  duplicateCodeValidator(control: AbstractControl): ValidationErrors | null {
    if (this.updateFlag) {
      return null;
    } else {
      const code = control.value;
      if (this.duplicateCheck.vmastercheckDuplicateCode(code, this.Vmaster)) {
        return { duplicateCode: true };
      }
      return null;
    }
  }
  gotoDashBoard() {
    this.router.navigate(['/dashboard']);
  }
  vazhipadTime = [
    {
      id: '0',
      name: 'Any time',
    },
    {
      id: '1',
      name: 'Morning',
    },
    {
      id: '2',
      name: 'Evening',
    },
    {
      id: '3',
      name: 'Night',
    },
  ];

  fetchDeities(): void {
    this.masterService.getPmaster().subscribe({
      next: (data: any[]) => {
        this.deities = data;
        this.addDeitiesCheckboxes();
      },
      error: (error) => {
        console.error('Error fetching deities', error);
      },
    });
  }
  addDeitiesCheckboxes(): void {
    const deitiesFormArray = this.vazhipadMasterForm.get(
      'deities'
    ) as FormArray;
    this.deities.forEach(() =>
      deitiesFormArray.push(this.formBuilder.control(false))
    );
  }

  get deitiesFormArray() {
    return this.vazhipadMasterForm.get('deities') as FormArray;
  }

  // duplicate name check validators
  duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
    const name = control.value;
    const code = this.code;
    console.log({ name, code, a: this.updateFlag });
    if (this.updateFlag) {
      if (
        this.duplicateCheck.vmastercheckDuplicateUpdateName(
          name,
          this.Vmaster,
          code
        )
      ) {
        return null;
      } else if (
        this.duplicateCheck.vmastercheckDuplicateName(name, this.Vmaster)
      ) {
        return { duplicateName: true };
      } else {
        return null;
      }
    } else {
      if (this.duplicateCheck.vmastercheckDuplicateName(name, this.Vmaster)) {
        return { duplicateName: true };
      }
      return null;
    }
  }

  // duplicate regional check validators
  duplicateRegionalNameValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const name = control.value;
    const code = this.code;

    if (this.updateFlag) {
      if (
        this.duplicateCheck.vmastercheckDuplicateUpdateRegionalName(
          name,
          this.Vmaster,
          code
        )
      ) {
        return null;
      } else if (
        this.duplicateCheck.vmastercheckDuplicateRegionalName(
          name,
          this.Vmaster
        )
      ) {
        return { duplicateRName: true };
      } else {
        return null;
      }
    } else {
      if (
        this.duplicateCheck.vmastercheckDuplicateRegionalName(
          name,
          this.Vmaster
        )
      ) {
        return { duplicateRName: true };
      }
      return null;
    }
  }
}

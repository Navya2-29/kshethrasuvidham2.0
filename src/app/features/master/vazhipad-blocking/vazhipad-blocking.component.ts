import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { VazhipadBlocking } from '../../../models/vazhipadBlockingMaster.model';
import { BlockParameter } from '@angular/compiler';
import { NotificationService } from '../../../services/notification/notification.service';
import { VMList } from '../../../models/day-master.model';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-vazhipad-blocking',
  standalone: true,
  imports: [HeaderComponent, SpinnerComponent,MatSelectModule, MatIconModule,MatSelectModule, FormsModule, MatButtonModule, MatAutocompleteModule, AsyncPipe, CommonModule, ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './vazhipad-blocking.component.html',
  styleUrl: './vazhipad-blocking.component.css',
  providers: [DatePipe]
})
export class VazhipadBlockingComponent {

  searchQuery: string = '';
  BlockingMater: VazhipadBlocking[] = [];
  filteredBlockingMater: VazhipadBlocking[] = [];
  vazhipadBlockingForm: FormGroup;
  blockingCategory: boolean = false;
  VB_category: string = 'Yearly';
  nakshatham:any[];
  showNoRecordsMessage: boolean = false;
  filteredOptions: Observable<string[]>;
  blockingFlag: boolean = false;
  loading: boolean = false;
  today = new Date();
  updateFlag: boolean = false;
  Id: string;
  VM_Id: number;
  dateType: string;
  VMList:VMList[] = [];
  private formBuilder = inject(FormBuilder);
  private masterService = inject(MasterService);
  private notification = inject(NotificationService);
  templeName:string | null;
  toppings = new FormControl('');
  toppingList: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'];
  constructor(private datePipe: DatePipe , private router:Router) {
    // form model
    this.templeName=localStorage.getItem('TempleName') 
    this.vazhipadBlockingForm = this.formBuilder.group({
      VM_code: ['', [Validators.required]],
      VM_name: ['', ],
      VB_FromDate: [''],
      VB_ToDate: [''],
      VB_Reasion: ['', [Validators.required]],
      Nakshathra: ["0"],
      VB_radio: ['Y', ],
      VB_DateType: ['E',],
      VB_MalFDay: ['',[Validators.pattern('^[1-9][0-9]*$')]],
      VB_MalFMonth: ['',[Validators.pattern('^[1-9][0-9]*$')]],
      VB_MalFYear: ['',[Validators.pattern('^[1-9][0-9]*$')]],
      VB_MalTDay: ['',[Validators.pattern('^[1-9][0-9]*$')]],
      VB_MalTMonth: ['',[Validators.pattern('^[1-9][0-9]*$')]],
      VB_MalTYear: ['',[Validators.pattern('^[1-9][0-9]*$')]]
    })
  }

    ngOnInit() {

    this.getNakshthram();

    // get the radio button blocking values
    this.vazhipadBlockingForm.get('VB_radio')!.valueChanges.subscribe(value => {
      this.getCategory(value);
      this.updateFromDateAndToDateValidators();
    });

    // for getting date type values
    this.vazhipadBlockingForm.get('VB_DateType')!.valueChanges.subscribe(value => {
      this.getDteTpe(value);
      this.updateFromDateAndToDateValidators();
    });

    // displaying vazhipad name with code
    this.vazhipadBlockingForm.get('VM_code')!.valueChanges.pipe(
      debounceTime(300),
      switchMap((code) =>
        this.masterService.getVazhipadeByCode(code)
      )
    ).subscribe((response: any) => {
      if (response.length > 0) {
        this.vazhipadBlockingForm.get('VM_name')?.setValue(response[0].VM_Name);
        this.VM_Id = response[0].VM_Id;
        console.log(response);
        console.log(this.VM_Id)
      }
      else if (!response) {
        this.notification.showSuccess("Vazhipad is not exist for code");
      }
      else {
        this.vazhipadBlockingForm.get('VM_name')?.setValue('');
      }
    });

    this.getVazhipadBlockingMaster();
  }


  // get nakshthram
  getNakshthram() {
    this.masterService.getNakshthra().subscribe((res) => {
      console.log(res);
      this.nakshatham = res;
    })
  }

  // get Categary
  getCategory(category: string) {
    console.log(category);
    const fromDateControl = this.vazhipadBlockingForm.get('VB_FromDate');
    const toDateControl = this.vazhipadBlockingForm.get('VB_ToDate');
    if (category == 'Y') {
      this.VB_category = "Yearly";
      this.blockingFlag = false;
      fromDateControl!.setValidators([Validators.required]);
      toDateControl!.setValidators([Validators.required]);
    }
    else if (category == 'M') {
      this.VB_category = "Monthly";
      this.blockingFlag = false;

    }
    else {
      this.VB_category = "Nakshthra";
      this.blockingFlag = true;
      fromDateControl!.clearValidators();
      toDateControl!.clearValidators();
    }
  }

   getDteTpe(dateType: string) {
    if (dateType === "M" ) {
      this.dateType = "Malayalam";
        this.vazhipadBlockingForm.patchValue({
          VB_FromDate:"",
          VB_ToDate:""
        })
    }
    else {
      this.dateType = "English";
      this.vazhipadBlockingForm.patchValue({
      VB_MalFDay: "",
      VB_MalFMonth: "",
      VB_MalFYear: "",
      VB_MalTDay: "",
      VB_MalTMonth: "",
      VB_MalTYear: "",
      })
    }
  }

  // get vazhipadBlocking form controls
  get vazhipadBlockingControl() {
    return this.vazhipadBlockingForm.controls;
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd-MM-yyyy') || '';
  }

  // search functionality by pname
  onSearch(searchQuery: string) {
    if (!this.searchQuery.trim()) {
      this.filteredBlockingMater = this.BlockingMater;
    }
    else {
      this.filteredBlockingMater = this.BlockingMater.filter((data) => {
        console.log(data)
        return data.VM_Name.toLowerCase().includes(this.searchQuery) || data.VM_Code.toLowerCase().includes(this.searchQuery.toLowerCase()) || data.VB_ID.toString().toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    }
    this.showNoRecordsMessage = this.filteredBlockingMater.length === 0
  }


  // view blocking vazhipad
  getVazhipadBlockingMaster() {
    this.loading = false;
    const payLoad = {
      "Type": "BlockingALL", "Code": "12"
    }
    this.masterService.getBlockingMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data)
        if (data && data.length > 0) {
          // console.log(data)
          this.BlockingMater = data;
          this.filteredBlockingMater = this.BlockingMater;
          this.loading = false;
        }
      },
      error: (error) => {
        console.log(error);

      }
    });
  }

  // submit data
  onSubmit() {
    console.log(this.vazhipadBlockingForm.value);
    // console.log(data);
    const fromDateString = this.vazhipadBlockingForm.value.VB_FromDate;
    const toDateString = this.vazhipadBlockingForm.value.VB_ToDate;
    this.vazhipadBlockingForm.patchValue({
      VB_FromDate: this.formatDate(fromDateString),
      VB_ToDate: this.formatDate(toDateString)
    })
    this.loading = true;
    // console.log(data)

    if (this.vazhipadBlockingForm.valid) {
      const payLoad = {
        "vazhId": `${this.VM_Id}`,
        "VBID": "1",
        "VazhBlockType": this.vazhipadBlockingForm.value.VB_radio,
        "VazhDateType": this.vazhipadBlockingForm.value.VB_DateType,
        "Fromdate": this.vazhipadBlockingForm.value.VB_FromDate,
        "Todate": this.vazhipadBlockingForm.value.VB_ToDate,
        "VazhNakshatram": this.vazhipadBlockingForm.value.Nakshathra,
        "VazhReason": this.vazhipadBlockingForm.value.VB_Reasion,
        "VazhMalFday": this.vazhipadBlockingForm.value.VB_MalFDay,
        "VazhMalFMonth": this.vazhipadBlockingForm.value.VB_MalFMonth,
        "VazhMalFYear": this.vazhipadBlockingForm.value.VB_MalFYear,
        "VazhMalTDay": this.vazhipadBlockingForm.value.VB_MalTDay,
        "VazhMalTMonth": this.vazhipadBlockingForm.value.VB_MalTMonth,
        "VazhMalTYear": this.vazhipadBlockingForm.value.VB_MalFYear,
        "Cuser": "2",
        "Type": "INSERT"
      }
      console.log(payLoad)
      this.masterService.createBlockingMaster(payLoad).subscribe({
        next: (res) => {
          console.log(res);
          this.loading = false;
          this.notification.showSuccess("vazhipad blocking Details created successfully");
          this.onReset();
        },
        error: (error) => {
          // this.loading = true;
          console.log(error);
        }
      })
    }
    else {
      this.markFormGroupTouched(this.vazhipadBlockingForm);
      this.loading=false;
    }
  }

  // resetting form controls
  onReset() {
    this.loading = true;
    this.updateFlag = false;
    this.vazhipadBlockingForm.reset({
      VB_radio: "Y",
      VB_DateType: "E",
    }

    );

    this.ngOnInit();
    this.blockingFlag=false;
    this.VB_category = 'Yearly';
    this.loading = false;
  }


  //for editing the form fields
  onEdit(data: VazhipadBlocking) {
    this.loading = true;
    this.updateFlag = true;
    this.Id = data.VB_ID;
    this.VM_Id=data.VM_ID

    const fromDate = new Date(data.VB_FromDate);
    const toDate = new Date(data.VB_ToDate);
    this.vazhipadBlockingForm.patchValue({
      VM_code:data.VM_Code,
      VM_name:data.VM_Name,
      VB_FromDate: this.datePipe.transform(fromDate, 'yyyy-MM-dd'),
      VB_ToDate: this.datePipe.transform(toDate, 'yyyy-MM-dd'),
      VB_Reasion: data.VB_Reasion,
      Nakshathra: data.VB_Nakshatram,
      VB_radio: data.VB_BlockType,
      VB_DateType: data.VB_DateType,
      VB_MalFDay: data.VB_MalFDay,
      VB_MalFMonth: data.VB_MalFMonth,
      VB_MalFYear: data.VB_MalFYear,
      VB_MalTDay: data.VB_MalTDay,
      VB_MalTMonth: data.VB_MalTMonth,
      VB_MalTYear: data.VB_MalTYear,
    });
    this.loading = false;
  }

  //update data
  onUpdate(updatedata: BlockParameter) {
    this.loading = true;
    const fromDateString = this.vazhipadBlockingForm.value.VB_FromDate;
    const toDateString = this.vazhipadBlockingForm.value.VB_ToDate;
    const payLoad={

      "vazhId": `${this.VM_Id}`,
        "VBID": `${this.Id}`,
        "VazhBlockType": this.vazhipadBlockingForm.value.VB_radio,
        "VazhDateType": this.vazhipadBlockingForm.value.VB_DateType,
        "Fromdate": this.formatDate(fromDateString),
        "Todate":  this.formatDate(toDateString),
        "VazhNakshatram": this.vazhipadBlockingForm.value.Nakshathra,
        "VazhReason": this.vazhipadBlockingForm.value.VB_Reasion,
        "VazhMalFday": this.vazhipadBlockingForm.value.VB_MalFDay.toString(),
        "VazhMalFMonth": this.vazhipadBlockingForm.value.VB_MalFMonth.toString(),
        "VazhMalFYear": this.vazhipadBlockingForm.value.VB_MalFYear.toString(),
        "VazhMalTDay": this.vazhipadBlockingForm.value.VB_MalTDay.toString(),
        "VazhMalTMonth": this.vazhipadBlockingForm.value.VB_MalTMonth.toString(),
        "VazhMalTYear": this.vazhipadBlockingForm.value.VB_MalFYear.toString(),
        "Cuser": "2",
        "Type": "UPDATE"
    }

    console.log(payLoad)
    this.masterService.updateBlockingMaster(payLoad).subscribe((res) => {
      this.loading = false;
      this.ngOnInit();
      this.notification.showSuccess("Updated successfully");
      console.log(res)
    })
  }


  // deleteData
  onDelete(id: string) {
    this.loading = true;
    const payLoad = {
      "Type": "Blocking", "Id": id
    }
    this.masterService.deleteBlockingMaster(payLoad).subscribe((res) => {
      this.loading = false;
      this.getVazhipadBlockingMaster();
      this.notification.showSuccess("Blocking Details deleted successfully");
    })
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
gotoDashBoard(){
  this.router.navigate(['/dashboard'])
}
updateFromDateAndToDateValidators() {
  const fromDateControl = this.vazhipadBlockingForm.get('VB_FromDate');
  const toDateControl = this.vazhipadBlockingForm.get('VB_ToDate');
  const category = this.vazhipadBlockingForm.get('VB_radio')?.value;
  const dateType = this.vazhipadBlockingForm.get('VB_DateType')?.value;

  if ((category === 'Y' && dateType === 'E') ||
      (category === 'M' && dateType === 'E') ||
      (category === 'N')) {
    fromDateControl?.setValidators([Validators.required]);
    toDateControl?.setValidators([Validators.required]);
  } else {
    fromDateControl?.clearValidators();
    toDateControl?.clearValidators();
  }

  fromDateControl?.updateValueAndValidity();
  toDateControl?.updateValueAndValidity();
}

}

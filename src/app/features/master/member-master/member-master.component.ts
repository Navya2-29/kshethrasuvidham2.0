import { vazhipad } from './../../../othervazhipad/othervazhipad.component';
import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../../../services/master/master.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { error } from 'pdf-lib';

@Component({
  selector: 'app-member-master',
  standalone: true,
  imports: [HeaderComponent,TranslateModule, SpinnerComponent, MatIconModule, MatButtonModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './member-master.component.html',
  styleUrl: './member-master.component.css'
})
export class MemberMasterComponent implements OnInit {
  rows: any[] = [];
  memeberForm: FormGroup;
  loading: boolean = false
  nakshatham: any[];
  searchQuery: string = '';
  userId: string | null;
  memberList: any[];
  editFlag:boolean=false;
  memberId:string;
  memberDetails:any[];
  templeName:string | null;
  vmActivelist: any[] = [];
  filteredPmaster: any[] = [];
  lang: string | null;

  private formBuilder = inject(FormBuilder);
  private masterservice = inject(MasterService);
  // constructor
  constructor(private notification: NotificationService,    private ts: TranslateService,
  
    private router:Router
  ) {
    this.addRow();
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.userId = localStorage.getItem("LoginId")
    this.templeName=localStorage.getItem('TempleName') 
  }

  ngOnInit(): void {
    this.getNakshthram();
    this.getDevoteeMaster()
    this.getAllActivevazhipad()
    this.memeberForm = this.formBuilder.group({
      name: ['',Validators.required],
      address1: ['',Validators.required],
      address2: [''],
      mobile: ['',[Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: [''],
      Amount:[''],
      VazhId:[''],
      endowment:[false],
      relativesDetails: this.formBuilder.array([])
    })
    this.addRelativeDetails();
    this.memeberForm.get('endowment')?.valueChanges.subscribe((checked) => {
      this.toggleEndowmentValidators(checked);
    });
  }

  private toggleEndowmentValidators(isChecked: boolean) {
    if (isChecked) {
      this.memeberForm.get('Amount')?.setValidators([Validators.required]);
      this.memeberForm.get('VazhId')?.setValidators([Validators.required]);
    } else {
      this.memeberForm.get('Amount')?.clearValidators();
      this.memeberForm.get('VazhId')?.clearValidators();
    }

    // Update validity state
    this.memeberForm.get('Amount')?.updateValueAndValidity();
    this.memeberForm.get('VazhId')?.updateValueAndValidity();
  }




  removeDevotee(index: number) {
    if (this.relativesDetails.length === 1) {
      this.notification.showError(
        'At least one devotee is required.',
        'Validation Error'
      );
      return;
    }
    this.relativesDetails.removeAt(index);
  }

  get relativesDetails() {
    return this.memeberForm.controls["relativesDetails"] as FormArray;
  }
  addRow() {
    this.rows.unshift({});
  }
  deleteRow(index: number): void {
    this.rows.splice(index, 1);
  }
  getNakshthram() {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterservice.getStarData(payLoad).subscribe((res) => {
      this.nakshatham = res;
      console.log(this.nakshatham);
    });
  }

  addRelativeDetails() {
    const relativeForm = this.formBuilder.group({
      Name: ['', Validators.required],
      Star: ['', Validators.required],
    });
    this.relativesDetails.push(relativeForm);
  }

  deleteRelativeDetails(lessonIndex: number) {
    this.relativesDetails.removeAt(lessonIndex);
  }
  onSubmit(data: any) {
    if(this.memeberForm.invalid){
      this.notification.showError("Please fil the form");
      return
    }
    console.log(data);
    const payLoad = {
      DevoteeName: data.name,
      Email: data.email,
      Mobile: data.mobile,
      MID: "",
      Cuser: this.userId,
      Address: data.address1,
      Type: "INSERT",
      Amount:data.Amount?data.Amount:"0",
      VazhId:data.VazhId?data.VazhId:"0",
      DevoteeDetails: data.relativesDetails.map((relative: any) => ({
        ...relative,
        MID: "" // Assigning MID to each relative dynamically
      }))

    }
    console.log(payLoad, "paylod")

    this.masterservice.AddDevoteeMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data)
        if (data.RespStatus === "I") {
          this.notification.showSuccess("Devotee details added successfully");
          this.resetForm();
          this.getDevoteeMaster()
        }else{
          this.notification.showError("Please try after some time");

        }
      },
      error:(err)=>{
        this.notification.showError(err);

      }
    })
  }

  getDevoteeMaster() {
    const payLoad = {
      Type: "DevoteeMaster",
      Code: ""
    }
    this.masterservice.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data, "get member details");
        this.memberList=data;
        this.filteredPmaster=data;
      }
    })
  }

  onDeleteAll(id:string){
    console.log(id);
    const payLoad={
      Type:"DevoteeMaster",
      Id:id.toString()
    }
    console.log(payLoad,"fffff")
  this.masterservice.deleteMaster(payLoad).subscribe({
    next:(data)=>{
      console.log(data);
      this.getDevoteeMaster()
    }
  })
  }

  onEdit(member:any){
  this.editFlag=true;
  this.memberId=member.MID;
  const payLoad={
    Type:"EditDevoteeMaster",
    Code:this.memberId
  }
this.memeberForm.patchValue({
  name: member.Name,
  address1: member.Address,
  
  mobile: member.mobile ,
  email: member.email,
})
this.masterservice.getMaster(payLoad).subscribe({
  next: (data) => {
    if (data && Array.isArray(data)) { // Ensure data is defined and an array
      this.memberDetails = data;
      this.relativesDetails.clear(); // Clear previous relatives before adding new ones

     
      console.log("Loaded member details:", this.memberDetails);

      // Add relatives dynamically
      this.memberDetails.forEach((relative: any) => {
        this.relativesDetails.push(this.formBuilder.group({
          Name: [relative.Name, Validators.required],
          Star: [relative.Star, Validators.required]
        }));
      });
    } else {
      console.error("Invalid data format received:", data);

    }
  },
  error: (err) => {
    console.error("Error fetching member details:", err);
    this.notification.showError("Error fetching member details:", err);

  }
});


}


onUpdate(data:any){
  this.editFlag=false
  if(data){
    const deletePayLoad={
      Type:"DevoteeDetails",
      Id:this.memberId
    }
    this.masterservice.deleteMaster(deletePayLoad).subscribe({
      next:(data)=>{
        console.log(data) ;
      },
    error:(err)=>{
      console.log(err)
    }
    }
  )
  }
  const payLoad = {
    DevoteeName: data.name,
    Email: data.email,
    Mobile: data.mobile,
    MID: this.memberId,
    Cuser: this.userId,
    Address: data.address1,
    Amount:data.Amount?data.Amount:"0",
    VazhId:data.VazhId?data.VazhId:"0",
    Type: "UPDATE",
    
    DevoteeDetails: data.relativesDetails.map((relative: any) => ({
      ...relative,
      MID: this.memberId // Assigning MID to each relative dynamically
    }))

  }
  console.log(payLoad, "paylod")
  this.masterservice.AddDevoteeMaster(payLoad).subscribe({
    next: (data) => {
      console.log(data)
      if (data.RespStatus === "U") {
        this.notification.showSuccess("Devotee details updated successfully")
        this.resetForm()
      }
    },error:(err)=>{
      console.log(err);
    }
  })

}


resetForm() {
  this.memeberForm.reset();
  this.relativesDetails.clear(); // Clears the FormArray
  this.addRelativeDetails(); // Ensures at least one relative entry remains
}


  gotoDashBoard() {
    this.router.navigate(['/dashboard']);
  } 

  printMemberslist(){
    this.router.navigate(["members-list"])
  }


  getAllActivevazhipad(){
      this.masterservice.getAllActiveVazhipad().subscribe((data) => {
        this.vmActivelist = data.map((item) => ({
          VM_Id: item.VM_Id,
          VM_Name: item.VM_Name,
          VM_Code: item.VM_Code,
          VM_RName: item.VM_RName,
        }));
        console.log(this.vmActivelist);
      });
  }
  onEndowmentChange() {
    this.toggleEndowmentFields();
  }


  
  private toggleEndowmentFields() {
    const endowmentChecked = this.memeberForm.get('endowment')?.value;
    if (!endowmentChecked) {
      this.memeberForm.get('Amount')?.reset();
      this.memeberForm.get('VazhId')?.reset();
    }
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredPmaster = this.memberList;
    } else {
      this.filteredPmaster = this.memberList.filter((data) => {
        console.log(data);
        return (
          data.Name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          data.mobile.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    }
  }

}

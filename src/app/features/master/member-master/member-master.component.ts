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

@Component({
  selector: 'app-member-master',
  standalone: true,
  imports: [HeaderComponent, SpinnerComponent, MatIconModule, MatButtonModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './member-master.component.html',
  styleUrl: './member-master.component.css'
})
export class MemberMasterComponent implements OnInit {
  rows: any[] = [];
  memeberForm: FormGroup;
  loading: boolean = false
  nakshatham: any[];
  userId: string | null;
  memberList: any[];
  editFlag:boolean=false;
  memberId:string;
  memberDetails:any[];
  templeName:string | null;
  private formBuilder = inject(FormBuilder);
  private masterservice = inject(MasterService);
  // constructor
  constructor(private notification: NotificationService,
    private router:Router
  ) {
    this.addRow();
    this.userId = localStorage.getItem("LoginId")
    this.templeName=localStorage.getItem('TempleName') 
  }

  ngOnInit(): void {
    this.getNakshthram();
    this.getDevoteeMaster()
    this.memeberForm = this.formBuilder.group({
      name: ['',Validators.required],
      address1: ['',Validators.required],
      address2: [''],
      mobile: ['',Validators.required],
      email: [''],
      relativesDetails: this.formBuilder.array([])
    })
    this.addRelativeDetails();
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
        }
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

      // Debugging Log
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
  }
});


}


onUpdate(data:any){
  if(data){
    const deletePayLoad={
      Type:"DevoteeDetails",
      Id:this.memberId
    }
    this.masterservice.deleteMaster(deletePayLoad).subscribe((data)=>{
      console.log(data,"delete devotee star And name")
    })
  }
  const payLoad = {
    DevoteeName: data.name,
    Email: data.email,
    Mobile: data.mobile,
    MID: this.memberId,
    Cuser: this.userId,
    Address: data.address1,
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
        this.notification.showSuccess("Devotee details added successfully")
        this.resetForm()
      }
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


}

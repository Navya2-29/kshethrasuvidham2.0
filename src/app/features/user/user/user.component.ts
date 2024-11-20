import { MasterService } from './../../../services/master/master.service';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [HeaderComponent,CommonModule,SpinnerComponent,MatIconModule,FormsModule,ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
loading:boolean=false;
userForm:FormGroup;
loginId:string |null;
staffList:any[]=[];
updateFlag:boolean=false;
id:string;
constructor(private fb:FormBuilder, private service:MasterService ,   ){
this.loginId=localStorage.getItem('LoginId');
this.userForm=this.fb.group({
  LoginId:[this.loginId],
  username:['',Validators.required],
  password:['',Validators.required],
  email:['',Validators.required],
  mobile:['',Validators.required],
  Address1:['',Validators.required],
  Role:['',Validators.required],
  Type:["INSERT"],
  Active:[true]
})

}
ngOnInit() {
this.getStaffList();
}




getStaffList(){
  const payLoad={"Type":"ListStaff","Code":""}
 this.service.getMaster(payLoad).subscribe((data)=>{
  console.log(data);
  this.staffList=data;
 })  
}


onSubmit(){
this.service.createStaffmanagement(this.userForm.value).subscribe({
  next:(data)=>{
    console.log(data);
    this.getStaffList();
    this.reset()
  }
})
}

reset(){
  this.userForm.reset({
    LoginId:this.loginId,
    Type:"INSERT",
    Active:true
  })
}
onEdit(item:any){
  this.id=item.UId;
  this.updateFlag=true;
  this.userForm.patchValue({
    username:item.UName,
    password:item.UPwd,
    email:item.UEmailId,
    mobile:item.Umobile,
    Address1:item.Address1,
    Role:item.Role,
    Type:"UPDATE"
  })
}



onUpdate(){
this.service.createStaffmanagement(this.userForm.value).subscribe((data)=>{
  console.log(data);
  this.getStaffList();
})
}


onDelete(id:string){
  const payLoad={"Type":"Staff","Id":id}
  this.service.deleteMaster(payLoad).subscribe((data)=>{
    console.log(data);
    this.getStaffList();
  })
}
}

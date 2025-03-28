import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MasterService } from './../../../services/master/master.service';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DuplicatecheckService } from '../../../services/duplicateCheckValidator/duplicatecheck.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    SpinnerComponent,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {
  loading: boolean = false;
  userForm: FormGroup;
  loginId: string | null;
  staffList: any[] = [];
  searchQuery: string = '';
  updateFlag: boolean = false;
  templeName:string | null;
  filteredUmaster: any[] = [];
  id: string;
  code: number;
  private duplicateCheck = inject(DuplicatecheckService);
  constructor(
    private fb: FormBuilder,
    private service: MasterService,
    private notification: ToastrService,
    private router:Router
  ) {
    this.loginId = localStorage.getItem('LoginId');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this.userForm = this.fb.group({
      LoginId: [''],
      username: ['', [ Validators.required,
        Validators.pattern('[a-zA-Z\\s]*'),
        Validators.maxLength(100),
        this.duplicateNameValidator.bind(this),]],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{10}$/), // Ensures a 10-digit number
        ],
      ],
      Address1: [''],
      Role: ['', Validators.required],
      Type: ['INSERT'],
      Active: [true],
    });
  }

  ngOnInit() {
    this.getStaffList();
  }

  getStaffList() {
    const payLoad = { Type: 'ListStaff', Code: '' };
    this.service.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data);
        this.staffList = data;
        this.filteredUmaster= this.staffList
      },
      error: (err) => {
        this.notification.error(
          'Failed to load staff list. Please try again later.'
        );
        console.error(err);
      },
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      if (this.userForm.get('username')?.errors?.['required']) {
        this.notification.error('Username is required', 'Validation Error');
      }
      if (this.userForm.get('password')?.errors?.['required']) {
        this.notification.error('password is required', 'Validation Error');
      }

      if (this.userForm.get('mobile')?.errors?.['required']) {
        this.notification.error(
          'Mobile number is required',
          'Validation Error'
        );
      } else if (this.userForm.get('mobile')?.errors?.['pattern']) {
        this.notification.error(
          'Mobile number must be a 10-digit number',
          'Validation Error'
        );
      }

      if (this.userForm.get('email')?.errors?.['required']) {
        this.notification.error(' Email is required', 'Validation Error');
      } else if (this.userForm.get('email')?.errors?.['email']) {
        this.notification.error('Invalid email format', 'Validation Error');
      }

      if (this.userForm.get('Role')?.errors?.['Role']) {
        this.notification.error('Please select the role', 'Validation Error');
      }
      return;
    }

    const payLoad = {
      LoginId: '',
      username: this.userForm.value.username,
      password: this.userForm.value.password,
      email: this.userForm.value.email,
      mobile: this.userForm.value.mobile,
      Address1: this.userForm.value.Address1,
      Role: this.userForm.value.Role,
      Type: 'INSERT',
      Active: this.userForm.value.Active == true ? 'Y' : 'N',
    };
    console.log(payLoad, 'new onedata');
    this.service.createStaffmanagement(payLoad).subscribe({
      next: (data) => {
        if (data.RespStatus === 'I') {
          console.log(data);
          this.getStaffList();
          this.reset();
        } else {
          this.notification.error(
            'something went wrong please try after some time'
          );
        }
      },
    });
  }

  reset() {
    this.userForm.reset({
      LoginId: '',
      Type: 'INSERT',
      Active: true,
      username: '',
      password: '',
      email: '',
      mobile: '',
      Address1: '',
      Role: '',
    });
  }

  onEdit(item: any) {
    this.id = item.UId;
    this.updateFlag = true;
    console.log(item);
    this.userForm.patchValue({
      LoginId: item.UId,
      username: item.UName,
      password: item.UPwd,
      email: item.UEmailId,
      mobile: item.Umobile,
      Address1: item.Address1,
      Role: item.Role,
      Type: 'UPDATE',
      Active: item.Active === 'Y' ? true : false,
    });
  }

  onUpdate() {
    console.log(this.userForm.value, 'update');
    const payLoad = {
      LoginId: this.id,
      username: this.userForm.value.username,
      password: this.userForm.value.password,
      email: this.userForm.value.email,
      mobile: this.userForm.value.mobile,
      Address1: this.userForm.value.Address1,
      Role: this.userForm.value.Role,
      Type: 'UPDATE',
      Active: this.userForm.value.Active == true ? 'Y' : 'N',
    };
    console.log(payLoad, 'upload payoa');
    this.service.createStaffmanagement(payLoad).subscribe((data) => {
      console.log(data);

      if (data.RespStatus === 'U') {
        this.notification.success('User Data Updated successfully');
        this.getStaffList();
        this.updateFlag = false;
        this.reset();
      } else {
        this.notification.error(
          'something went wrong please try after some time'
        );
      }
    });
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      const payLoad = { Type: 'Staff', Id: id };
      this.service.deleteMaster(payLoad).subscribe((data) => {
        console.log(data);
        this.getStaffList();
      });
    }
  }


  gotoBack(){
    this.router.navigate(['/dashboard'])
  }

  
// duplicate code check validators
duplicateNameValidator(control: AbstractControl): ValidationErrors | null {
  const name = control.value;
  const code = this.id;

  if (this.updateFlag) {
    if (
      this.duplicateCheck.checkDuplicateUpdatePname(name, this.staffList, code)
    ) {
      return null;
    } else if (this.duplicateCheck.checkDuplicateName(name, this.staffList)) {
      return { duplicateName: true };
    } else {
      return null;
    }
  } else {
    if (this.duplicateCheck.checkDuplicateName(name, this.staffList)) {
      return { duplicateName: true };
    }
    return null;
  }
}

get pmasterFormFormControl() {
  return this.userForm.controls;
}




// search functionality by name and code
onSearch() {
  if (!this.searchQuery.trim()) {
    this.filteredUmaster = this.staffList;
  } else {
    this.filteredUmaster = this.staffList.filter((data) => {
      console.log(data);
      return (
        data.UName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        data.Umobile.toLowerCase().includes(this.searchQuery.toLowerCase())||
        data.UEmailId.toLowerCase().includes(this.searchQuery.toLowerCase())

      );
    });
  }
  // this.showNoRecordsMessage = this.filteredPmaster.length === 0;
}


}

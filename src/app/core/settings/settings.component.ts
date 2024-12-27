import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../layout/header/header.component';
import { SpinnerComponent } from '../../shared/component/spinner/spinner.component';
import { Router, TitleStrategy } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MasterService } from '../../services/master/master.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Settings } from '../../models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    HeaderComponent,
    SpinnerComponent,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  settingsForm: FormGroup;
  loading: boolean = false;
  templeName: string | null;
  templeDetails: Settings | null = null;
  billType: string = '';
  private formBuilder = inject(FormBuilder);
  private masterService = inject(MasterService);
  private notification = inject(ToastrService);
  constructor(private router: Router) {
    this.templeName = localStorage.getItem('TempleName');
    this.settingsForm = this.formBuilder.group({
      templeName: ['', Validators.required],
      templeAddress: ['', Validators.required],
      language: ['', Validators.required],
      printer: ['', Validators.required],
      logo: [''],
      Counter: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  gotoDashBoard() {
    this.router.navigate(['/dashboard']);
  }

  updateSettings() {
    if (this.settingsForm.valid) {
      console.log(this.settingsForm.value);

      console.log(this.settingsForm.value);
      const payLoad = {
        Name: this.settingsForm.value.templeName,
        Address: this.settingsForm.value.templeAddress,
        Phone: this.settingsForm.value.phone,
        Email: this.settingsForm.value.email,
        logo: 'temple-logo.png',
        Language: this.settingsForm.value.language,
        Counter: String(this.settingsForm.value.Counter),
        Printer: this.settingsForm.value.printer,
      };
      console.log(payLoad, 'payload');
      this.masterService.upDateSettings(payLoad).subscribe({
        next: (data) => {
          console.log(data);
          if (data.RespStatus === 'U') {
            this.notification.success('Temple details updated successfully!');
            this.changeSettings();
          }
        },
        error: (err) => {
          this.notification.error('Check your Connection and Try again');
        },
      });
    } else {
      this.notification.error('Please fill out all required fields correctly.');
    }
  }

  ngOnInit() {
    this.getTempleDetails();
  }

  getTempleDetails() {
    this.masterService.settingsData().subscribe((data) => {
      console.log(data, 'settings');
      this.templeDetails = data[0];
      if (this.templeDetails) {
        this.settingsForm.patchValue({
          templeName: this.templeDetails.Name,
          templeAddress: this.templeDetails.Address,
          language: this.templeDetails.Language,
          printer: this.templeDetails.Printer,
          // logo:this.templeDetails.logo,
          Counter: this.templeDetails.Counter,
          phone: this.templeDetails.phone,
          email: this.templeDetails.email,
        });
      }
    });
  }
  changeSettings() {
    this.getTempleDetails();
    localStorage.setItem('Language', this.templeDetails?.Language || '');
    localStorage.setItem('Language', this.templeDetails?.Language || '');
  }

  unLockBillNumber() {
    console.log(this.billType);
    if (this.billType) {
      const payLoad = {
        Type: this.billType,
        code: '',
      };
      this.masterService.getMaster(payLoad).subscribe({
        next: (data) => {
          console.log(data);
          if (data) {
            this.notification.success('Bill number unlocked successfully');
          }
        },
        error: (err) => {
          this.notification.error(err);
        },
      });
    } else {
      this.notification.error('Please select Bill type to unLock ');
    }
  }
}

import { MasterService } from './../../../services/master/master.service';
import { ToastrService } from 'ngx-toastr';
import { AfterViewInit, Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CouterPopupComponent } from '../../couter-popup/couter-popup.component';
import { AuthService } from '../../auth/service/auth.service';
import { FrontComponent } from '../front/front.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
    
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  hide: boolean = true;
  loading: boolean = false;
  errorMessage = '';
  templeName: string | null;
  logo: string | null;
  todayDate: Date = new Date();
  Role: string | null;
  countercount: number;
  allowedContercount: number | null;
  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private service: MasterService,
    private notification: ToastrService
  ) {
    this.templeName = localStorage.getItem('TempleName');
    this.logo = localStorage.getItem('Logo');
    // this.Role = localStorage.getItem('Role');
    this.allowedContercount = Number(localStorage.getItem('Counter'));
    this.Role = localStorage.getItem('Role');
    console.log(this.allowedContercount, 'ss');
    this.getcounterCount();

    console.log(this.countercount > this.allowedContercount, 'bbb');
}
ngOnInit(): void {
  const storedCounterId = localStorage.getItem('counterId');
  if (!storedCounterId) {
    this.openCounterIdDialog();
  }
}

getLogoUrl(): string {
  return `assets/images/${this.logo}`; 
}

openCounterIdDialog(): void {
  const dialogRef = this.dialog.open(CouterPopupComponent, {
    width: '300px',
    disableClose: true,
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      // Store the entered Counter ID in localStorage
      this.getcounterCount();
      if (this.Role == 'admin' || this.Role == 'super' ) {
        localStorage.setItem('counterId', result);
      } else {

        const payLoad = {
          Type: 'CounterId',
          Code: result,
        };
        if (
          this.countercount != null &&
          this.allowedContercount != null &&
          this.countercount >= this.allowedContercount
        ) {
          this.notification.error(
            'Counter limit exceeded. Please contact the Kshethrasuvidham for assistance.'
          );
          this.openCounterIdDialog();
        } else {
         
            this.service.ADDCOUNTER(payLoad).subscribe((data: any) => {
              console.log(data, 'sass');
              if (data.RespStatus === 'I') {
                localStorage.setItem('counterId', result);
              } else {
                this.openCounterIdDialog();
              }
            }); 
        }
      }
    }
  });
}

getcounterCount() {
  const payLoad = {
    Type: 'CounterCount',
    Code: '',
  };
  this.service.getMaster(payLoad).subscribe((data) => {
    console.log(data);
    this.countercount = data[0].cnt;
    console.log(this.countercount, 'cc');
    // if (this.countercount != null && this.allowedContercount != null && this.countercount > this.allowedContercount) {
    //   this.openCounterIdDialog()
    // }
  });
}


}

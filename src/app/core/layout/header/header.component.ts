import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MenuComponent } from '../menu/menu.component';
import { AreaComponent } from '../../../features/Billing/area/area.component';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from '../../auth/change-password/change-password.component';
import { MatDialog } from '@angular/material/dialog';
import { MasterService } from '../../../services/master/master.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MenuComponent,
    
    MatMenuModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private router = inject(Router);
  private masterService=inject(MasterService);
  showFiller = false;
  userName: string | null = '';
  role:string |null='';
  counterId:string |null='';
  templeName:string |null='';
  logo:string |null='';
  today:string;
  day:string;
  mdate:string;
  nal:string;
  constructor(private dialog: MatDialog,) {
    this.userName = localStorage.getItem('name');
    this.role=localStorage.getItem('Role');
    this.counterId=localStorage.getItem('counterId');
this.templeName=localStorage.getItem('TempleName');
this.logo=localStorage.getItem('Logo');
  }

  logout() {
    localStorage.setItem('loggedIn', 'false');
    localStorage.removeItem('name');
    localStorage.removeItem('Role');
    localStorage.removeItem('alertmsg');
    localStorage.removeItem('LoginId');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    // if(this.role==='admin'){
    //   localStorage.removeItem('counterId');
    // }
    this.router.navigate(['/login']);
  }
  goBack(){
    this.router.navigate(['/front']);

  }
  openChangepasswordDialog(){
     const dialogRef = this.dialog.open(ChangePasswordComponent, {
          width: '300px',
          disableClose: true,
        });
    
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
          }
        })
  }
  
ngOnInit() {
this.hetHeaderDatesInfomation();
}

hetHeaderDatesInfomation(){
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start from 0
const dd = String(today.getDate()).padStart(2, '0');
const formattedDate = `${yyyy}-${mm}-${dd}`;

  const payLoad={
    Type:"MalayalamDate",
    Code:formattedDate
  }

  this.masterService.getMaster(payLoad).subscribe({
    next:(data)=>{
      console.log(data);
      this.today=data[0].Date;
      this.day=data[0].day;
      this.mdate=data[0].mdate;
      this.nal=data[0].nal
    }
  })
}



}

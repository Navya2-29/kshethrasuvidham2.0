import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PmasterComponent } from './pmaster/pmaster.component';
import { CmasterComponent } from './cmaster/cmaster.component';
import { VmasterComponent } from './vmaster/vmaster.component';
import { PanjankamComponent } from './panjankam/panjankam.component';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VazhipadBlockingComponent } from './vazhipad-blocking/vazhipad-blocking.component';
import { SeasonalMasterComponent } from './seasonal-master/seasonal-master.component';
import { MemberMasterComponent } from './member-master/member-master.component';
import { VihidhamMasterComponent } from './vihidham-master/vihidham-master.component';
import { SpecialdayMasterComponent } from './specialday-master/specialday-master.component';
import { DayMasterComponent } from './day-master/day-master.component';
import { ComboMasterComponent } from './combo-master/combo-master.component';
import { ItemMAterComponent } from './item-mater/item-mater.component';
import { authGuard } from './auth/guard/auth.guard';



export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent ,canActivate:[authGuard]},
  { path: 'pmaster', component: PmasterComponent ,canActivate:[authGuard] },
  { path: 'cmaster', component: CmasterComponent ,canActivate:[authGuard] },
  { path: 'vmaster', component: VmasterComponent ,canActivate:[authGuard]},
  { path: 'panjankam', component: PanjankamComponent ,canActivate:[authGuard] },
  {path:'vazhipad-blocking',component:VazhipadBlockingComponent ,canActivate:[authGuard]},
  {path:'seasonal',component:SeasonalMasterComponent ,canActivate:[authGuard]},
  {path:'member-master',component:MemberMasterComponent ,canActivate:[authGuard]},
  {path:'vihidham-master',component:VihidhamMasterComponent ,canActivate:[authGuard]},
  {path:'day-master',component:DayMasterComponent ,canActivate:[authGuard]},
  {
    path:'special-day-master',component:SpecialdayMasterComponent ,canActivate:[authGuard]
  },
  {
    path:'combo-master',component:ComboMasterComponent,canActivate:[authGuard]
  },
  {
    path:'item-master',component:ItemMAterComponent,canActivate:[authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule],
})

export class approutingmodule{}
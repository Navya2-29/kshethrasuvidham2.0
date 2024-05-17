import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
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



export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pmaster', component: PmasterComponent },
  { path: 'cmaster', component: CmasterComponent },
  { path: 'vmaster', component: VmasterComponent },
  { path: 'panjankam', component: PanjankamComponent },
  {path:'vazhipad-blocking',component:VazhipadBlockingComponent},
  {path:'seasonal',component:SeasonalMasterComponent},
  {path:'member-master',component:MemberMasterComponent},
  {path:'vihidham-master',component:VihidhamMasterComponent},
  {path:'day-master',component:DayMasterComponent},
  {
    path:'special-day-master',component:SpecialdayMasterComponent
  },
  {
    path:'combo-master',component:ComboMasterComponent
  },
  {
    path:'item-master',component:ItemMAterComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule],
})

export class approutingmodule{}
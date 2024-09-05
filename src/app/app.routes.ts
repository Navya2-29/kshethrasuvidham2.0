import { Routes } from '@angular/router';

import { DashboardComponent } from './features/Billing/dashboard/dashboard.component';
import { PmasterComponent } from './features/master/pmaster/pmaster.component';
import { CmasterComponent } from './features/master/cmaster/cmaster.component';
import { VmasterComponent } from './features/master/vmaster/vmaster.component';
import { PanjankamComponent } from './panjankam/panjankam.component';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VazhipadBlockingComponent } from './features/master/vazhipad-blocking/vazhipad-blocking.component';
import { SeasonalMasterComponent } from './features/master/seasonal-master/seasonal-master.component';
import { MemberMasterComponent } from './features/master/member-master/member-master.component';
import { VihidhamMasterComponent } from './features/master/vihidham-master/vihidham-master.component';
import { SpecialdayMasterComponent } from './features/master/specialday-master/specialday-master.component';
import { DayMasterComponent } from './features/master/day-master/day-master.component';
import { ComboMasterComponent } from './features/master/combo-master/combo-master.component';
import { ItemMAterComponent } from './features/master/item-mater/item-mater.component';
import { LoginComponent } from './core/auth/login/login.component';
import { authGuard } from './core/auth/guard/auth.guard';
import { StarMasterComponent } from './features/master/star-master/star-master.component';
import { CalendarComponent } from './calendar/calendar.component';
import { VazhipadVivaramComponent } from './features/Billing/vazhipad-vivaram/vazhipad-vivaram.component';
import { MattinangalComponent } from './features/Billing/mattinangal/mattinangal.component';



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
  },
  {
    path:'star-master',component:StarMasterComponent,canActivate:[authGuard]
  },
  {
    path:'calander',component:CalendarComponent,canActivate:[authGuard]
  },
  
  {
    path:'mattinagal',component:MattinangalComponent,canActivate:[authGuard]
  },
  {
    path:'**',pathMatch:'full', redirectTo:'/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule],
})

export class approutingmodule{}

import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PmasterComponent } from './pmaster/pmaster.component';
import { CmasterComponent } from './cmaster/cmaster.component';
import { VmasterComponent } from './vmaster/vmaster.component';
import { PanjankamComponent } from './panjankam/panjankam.component';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';



export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pmaster', component: PmasterComponent },
  { path: 'cmaster', component: CmasterComponent },
  { path: 'vmaster', component: VmasterComponent },
  { path: 'panjankam', component: PanjankamComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule],
})

export class approutingmodule{}
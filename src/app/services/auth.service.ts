import { Injectable, inject } from '@angular/core';
import { Constant } from '../constants/constant';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 isLoggedIn:boolean=false;
  private httpClient=inject(HttpClient)
  constructor() { }

login(login:any){
 return this.httpClient.get<any>(Constant.BASE_URL+Constant.METHODS.LOGIN);
}
isLogged(){
  this.isLoggedIn=true;
}
logout(): void {
  this.isLoggedIn = false;
}
}

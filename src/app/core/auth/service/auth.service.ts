import { Injectable, inject } from '@angular/core';
import { Login } from '../../../models/login.model';
import { HttpClient } from '@angular/common/http';
import { Constant } from '../../../constants/constant';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private  httpClient=inject(HttpClient);
  constructor() { }



  getLoginInfo(login:Login){
    console.log(login)
    // console.log(login.username,login.password +"service");
    const reqBody={"username":login.username,"password":login.password}
  return this.httpClient.post<any>(Constant.BASE_URL+Constant.METHODS.LOGIN,reqBody)
  }


  isAuthenticated(): boolean {
    const loggedIn = localStorage.getItem('loggedIn');
    return loggedIn === 'true';
  }

}

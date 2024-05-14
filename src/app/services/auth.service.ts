import { Injectable, inject } from '@angular/core';
import { Constant } from '../constants/constant';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  private httpClient=inject(HttpClient)
  constructor() { }

login(login:any){
 return this.httpClient.post<any>(Constant.BASE_URL+Constant.METHODS,login);
}


}

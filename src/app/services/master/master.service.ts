import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { CreatePmaster, Pmaster } from '../../models/pmaster.model';
import { Constant } from '../../constants/constant';
@Injectable({
  providedIn: 'root'
})
export class MasterService {
  private readonly http = inject(HttpClient);

  constructor() { }

  // pmster service
  // get all prathishta list
  getPmaster(): Observable<Pmaster[]> {
    return this.http.get<Pmaster[]>(Constant.BASE_URL + Constant.METHODS.GET_PMASTER).pipe(catchError(this.errorHandler))
  }

  // create prathishta
  createPmaster(obj: CreatePmaster): Observable<any> {
    return this.http.post<CreatePmaster>(Constant.BASE_URL + Constant.METHODS.CREATE_PMASTER, obj).pipe(catchError(this.errorHandler))
  }

  // update pmaster
  updatePmaster(id: string, obj: CreatePmaster): Observable<any> {
    return this.http.put<CreatePmaster>(Constant.BASE_URL + Constant.METHODS.UPDATE_PMASTER + id, obj).pipe(catchError(this.errorHandler))
  }

  // delete pmaster
  delete(id: string): Observable<any> {
    return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_PMASTER + id).pipe(catchError(this.errorHandler))
  }
 
  // cmaster service

  getCmaster(): Observable<Pmaster[]> {
    return this.http.get<Pmaster[]>(Constant.BASE_URL + Constant.METHODS.GET_PMASTER).pipe(catchError(this.errorHandler))
  }

  // create category
  createCmaster(obj: CreatePmaster): Observable<any> {
    return this.http.post<CreatePmaster>(Constant.BASE_URL + Constant.METHODS.CREATE_PMASTER, obj).pipe(catchError(this.errorHandler))
  }

  // update category
  updateCmaster(id: string, obj: CreatePmaster): Observable<any> {
    return this.http.put<CreatePmaster>(Constant.BASE_URL + Constant.METHODS.UPDATE_PMASTER + id, obj).pipe(catchError(this.errorHandler))
  }

  // delete categor
  deleteCmaster(id: string): Observable<any> {
    return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_PMASTER + id).pipe(catchError(this.errorHandler))
  }


  // error handling
  private errorHandler(error: HttpErrorResponse) {

    //
    return throwError(() => new Error('Error occurred'));
  }

}

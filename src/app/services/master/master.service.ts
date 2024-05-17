import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { CreatePmaster, Pmaster } from '../../models/pmaster.model';
import { Constant } from '../../constants/constant';
import { Cmaster, CreateCmaster } from '../../models/cmaster.model';
import { Vmaster } from '../../models/vmaster.model';
import { SpecialDayMaster, SpecialDayMasterList } from '../../models/special-day-master.model';
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
  // get category
  getCmaster(): Observable<Cmaster[]> {
    return this.http.get<Cmaster[]>(Constant.BASE_URL + Constant.METHODS.GET_CMASTER).pipe(catchError(this.errorHandler))
  }

  // create category
  createCmaster(obj: CreateCmaster): Observable<any> {
    return this.http.post<CreateCmaster>(Constant.BASE_URL + Constant.METHODS.CREATE_CMASTER, obj).pipe(catchError(this.errorHandler))
  }

  // update category
  updateCmaster(id: string, obj: CreateCmaster): Observable<any> {
    return this.http.put<CreateCmaster>(Constant.BASE_URL + Constant.METHODS.UPDATE_CMASTER + id, obj).pipe(catchError(this.errorHandler))
  }

  // delete categor
  deleteCmaster(id: string): Observable<any> {
    return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_CMASTER + id).pipe(catchError(this.errorHandler))
  }

  // vamster service
  getVmaster(): Observable<Vmaster[]> {
    return this.http.get<Vmaster[]>(Constant.BASE_URL + Constant.METHODS.GET_VMASTER).pipe(catchError(this.errorHandler))
  }

  // create category
  createVmaster(obj: Vmaster): Observable<Vmaster> {
    return this.http.post<Vmaster>(Constant.BASE_URL + Constant.METHODS.CREATE_VMASTER, obj).pipe(catchError(this.errorHandler))
  }

  // update category
  updateVmaster(id: string, obj: Vmaster): Observable<any> {
    return this.http.put<Vmaster>(Constant.BASE_URL + Constant.METHODS.UPDATE_VMASTER + id, obj).pipe(catchError(this.errorHandler))
  }

  // delete categor
  deleteVmaster(id: string): Observable<any> {
    return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_VMASTER + id).pipe(catchError(this.errorHandler))
  }


  

// special day master
// get list special vazhipad
  getAllSpecialVazhipadList():Observable<SpecialDayMasterList[]>{
    return this.http.get<SpecialDayMasterList[]>(Constant.BASE_URL+Constant.METHODS.GET_VSPECIAL)
  }

  //// get list special vazhipad
 getSpecialDayMaster():Observable<SpecialDayMaster[]>{
    return this.http.get<SpecialDayMaster[]>(Constant.BASE_URL+Constant.METHODS.GET_ALL_SPECIAL)
  }

  // create special day
  createSpecialDayMaster(data:SpecialDayMaster):Observable<SpecialDayMaster>{
    return this.http.post<SpecialDayMaster>(Constant.BASE_URL+Constant.METHODS.CREATE_VSPECIAL,data);
  }

  // update special day
  updateSpecialDay(id: string, obj: SpecialDayMaster): Observable<any> {
    return this.http.put<SpecialDayMaster>(Constant.BASE_URL + Constant.METHODS.UPDATE_VSPECIAL + id, obj).pipe(catchError(this.errorHandler))
  }

  // delete special day
  deleteSpecialDay(id: string): Observable<any> {
    return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_VSPECIAL+ id).pipe(catchError(this.errorHandler))
  }

// get nakshthram
getNakshthra():Observable<string[]>{
  return this.http.get<string[]>('assets/data/nakshatras.json');
}

// get account heads
getAccountHeads():Observable<any>{
  return this.http.get<any>('assets/data/accountHead.json');
}

  // error handling
  private errorHandler(error: HttpErrorResponse) {

    //
    return throwError(() => new Error('Error occurred'));
  }

}

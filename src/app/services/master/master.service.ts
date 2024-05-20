import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { CreatePmaster, Pmaster } from '../../models/pmaster.model';
import { Constant } from '../../constants/constant';
import { Cmaster, CreateCmaster } from '../../models/cmaster.model';
import { AccountHead, AccountSubHead, Vmaster } from '../../models/vmaster.model';
import { SpecialDayMaster, SpecialDayMasterList } from '../../models/special-day-master.model';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
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

  // create vamster
  createVmaster(obj: Vmaster): Observable<Vmaster> {
    return this.http.post<Vmaster>(Constant.BASE_URL + Constant.METHODS.CREATE_VMASTER, obj).pipe(catchError(this.errorHandler))
  }

  // update vamster
  updateVmaster(id: number, obj: Vmaster): Observable<Vmaster> {
    return this.http.put<Vmaster>(Constant.BASE_URL + Constant.METHODS.UPDATE_VMASTER + id, obj).pipe(catchError(this.errorHandler))
  }

  // delete vamster
  deleteVmaster(id: string): Observable<void> {
    return this.http.delete<void>(Constant.BASE_URL + Constant.METHODS.DELETE_VMASTER + id).pipe(catchError(this.errorHandler))
  }
  // get vmaster category
getVmasterCategory():Observable<Cmaster[]>{
  return this.http.get<Cmaster[]>(Constant.BASE_URL+Constant.METHODS.GET_VCATEGORY)
}
// get vmaster prethishta
getVmasterPrathishta():Observable<Pmaster[]>{
  return this.http.get<Pmaster[]>(Constant.BASE_URL+Constant.METHODS.GET_VPRATHISHTA)
}

  

// // seasonl master master
// get list  seasonl master vazhipad
  getAllSeasonalMasterVazhipadList():Observable<any[]>{
    return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_VSPECIAL)
  }

  //// get list seasonl master
 getSeasonalMaster():Observable<any[]>{
    return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_VSEASONAL)
  }

  // create  seasonl master
  createSeasonalMaster(data:any):Observable<any>{
    return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.CREATE_VSEASONAL,data);
  }

  // update  seasonl master
  updateSeasonalMaster(id: string, obj: any): Observable<any> {
    return this.http.put<any>(Constant.BASE_URL + Constant.METHODS.UPDATE_VSEASONAL+ id, obj).pipe(catchError(this.errorHandler))
  }

  // delete  seasonl master
  deleteSeasonalMaster(id: string): Observable<any> {
    return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_VSEASONAL+ id).pipe(catchError(this.errorHandler))
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
updateSpecialDay(id: Number, obj: SpecialDayMaster): Observable<any> {
  return this.http.put<SpecialDayMaster>(Constant.BASE_URL + Constant.METHODS.UPDATE_VSPECIAL + id, obj).pipe(catchError(this.errorHandler))
}

// delete special day
deleteSpecialDay(id: string): Observable<any> {
  return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_VSPECIAL+ id).pipe(catchError(this.errorHandler))
}



// vihidham master



//// get list vihidham master
getVihidhamMaster():Observable<any[]>{
  return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_ALL_VIHIDHAM)
}

// create  vihidham master
createVihidhamMaster(data:any):Observable<any>{
  return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.CREATE_VIHIDHAM,data);
}

// update  vihidham master
updateVihidhamMaster(id: string, obj: any): Observable<any> {
  return this.http.put<any>(Constant.BASE_URL + Constant.METHODS.UPDATE_VIHIDHAM+ id, obj).pipe(catchError(this.errorHandler))
}

// delete  vihidham master
deleteVihidhamMaster(id: string): Observable<any> {
  return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_VIHIDHAM+ id).pipe(catchError(this.errorHandler))
}



// item master

//// get list item master
getItemMaster():Observable<any[]>{
  return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_ALL_ITEM)
}

// create  item master
createItemMaster(data:any):Observable<any>{
  return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.CREATE_ITEM,data);
}

// update  item master
updateItemMaster(id: string, obj: any): Observable<any> {
  return this.http.put<any>(Constant.BASE_URL + Constant.METHODS.UPDATE_ITEM+ id, obj).pipe(catchError(this.errorHandler))
}

// delete  item master
deleteItemMaster(id: string): Observable<any> {
  return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_ITEM+ id).pipe(catchError(this.errorHandler))
}


// member details

getMember():Observable<any[]>{
  return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_ALL_MEMBER)
}

// create  member master
createMember(data:any):Observable<any>{
  return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.CREATE_MEMBER,data);
}

// update  member master
updateMember(id: string, obj: any): Observable<any> {
  return this.http.put<any>(Constant.BASE_URL + Constant.METHODS.UPDATE_MEMBER+ id, obj).pipe(catchError(this.errorHandler))
}

// delete  member master
deleteMember(id: string): Observable<any> {
  return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_MEMBER+ id).pipe(catchError(this.errorHandler))
}



// combo master
getAllComoVazhipadList():Observable<any[]>{
  return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_VCOMBO)
}

// get list combo vazhipad
getComboMaster():Observable<any[]>{
  return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_ALL_VCOMBO)
}
// create combo 
createComboMaster(data:any):Observable<any>{
  return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.CREATE_VCOMBO,data);
}

// update combo 
updateCombo(id: string, obj: any): Observable<any> {
  return this.http.put<any>(Constant.BASE_URL + Constant.METHODS.UPDATE_VCOMBO + id, obj).pipe(catchError(this.errorHandler))
}

// delete combo 
deleteCombo(id: string): Observable<any> {
  return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_VCOMBO+ id).pipe(catchError(this.errorHandler))
}

// day master


getAllDayVazhipadList():Observable<any[]>{
  return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_VDAY)
}
// get list day vazhipad
getDayMaster():Observable<any[]>{
  return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_ALL_VDAY)
}
// create  day
createDayMaster(data:any):Observable<any>{
  return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.CREATE_VDAY,data);
}

// update  day
updateDay(id: string, obj: any): Observable<any> {
  return this.http.put<any>(Constant.BASE_URL + Constant.METHODS.UPDATE_VDAY + id, obj).pipe(catchError(this.errorHandler))
}

// delete  day
deleteDay(id: string): Observable<any> {
  return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_VDAY+ id).pipe(catchError(this.errorHandler))
}

// blocking master

getAllBlockingVazhipadList():Observable<any[]>{
  return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_VBLOCK)
}
// get list block vazhipad
getBlockingMaster():Observable<any[]>{
  return this.http.get<any[]>(Constant.BASE_URL+Constant.METHODS.GET_ALL_VBLOCK)
}
// create block 
createBlockingMaster(data:any):Observable<any>{
  return this.http.post<any>(Constant.BASE_URL+Constant.METHODS.CREATE_VBLOCK,data);
}

// update block 
updateBlockingMaster(id: string, obj: any): Observable<any> {
  return this.http.put<any>(Constant.BASE_URL + Constant.METHODS.UPDATE_VBLOCK + id, obj).pipe(catchError(this.errorHandler))
}

// delete block
deleteBlockingMaster(id: string): Observable<any> {
  return this.http.delete<any>(Constant.BASE_URL + Constant.METHODS.DELETE_VBLOCK+ id).pipe(catchError(this.errorHandler))
}
// get nakshthram
getNakshthra():Observable<string[]>{
  return this.http.get<string[]>('assets/data/nakshatras.json');
}

// get account heads
getAccountHeads():Observable<AccountHead[]>{
  return this.http.get<AccountHead[]>(Constant.BASE_URL+Constant.METHODS.GET_ACCOUNTHEAD);
}
// get account sub heads
getSubAccountHeads():Observable<AccountSubHead[]>{
  return this.http.get<AccountSubHead[]>(Constant.BASE_URL+Constant.METHODS.GET_SUBACCOUNTHEAD);
}

  // error handling
  private errorHandler(error: HttpErrorResponse) {

    //
    return throwError(() => new Error('Error occurred'));
  }

}

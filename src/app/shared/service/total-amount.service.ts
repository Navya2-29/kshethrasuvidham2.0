import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TotalAmountService {

  constructor() { }
  private multidayDataSubject = new BehaviorSubject<any>(null);
  multidayData$ = this.multidayDataSubject.asObservable();

  setMultidayData(data: any) {
    this.multidayDataSubject.next(data);
  }


  private totalAmountSubject = new BehaviorSubject<number>(0);
  totalAmount$ = this.totalAmountSubject.asObservable();

  setTotalAmount(amount: number) {
    this.totalAmountSubject.next(amount);
  }

  private clickSubject = new Subject<void>();
  private firstComponentData: any;
  private secondComponentData: any;

  clickEvent$ = this.clickSubject.asObservable();

  emitClickEvent() {
    this.clickSubject.next();
  }

  setFirstComponentData(data: any) {
    this.firstComponentData = data;
  }

  getFirstComponentData(): any {
    return this.firstComponentData;
  }

  setSecondComponentData(data: any) {
    this.secondComponentData = data;
  }

  getSecondComponentData(): any {
    return this.secondComponentData;
  }

  getAllData(): any {
    return {
      ...this.firstComponentData,
      ...this.secondComponentData
    };
  }
  
}

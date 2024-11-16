import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptPrintService {
  private receiptDataSubject = new Subject<any>();
  receiptData$ = this.receiptDataSubject.asObservable();

  // Method to send data to other components
  setReceiptData(data: any) {
    this.receiptDataSubject.next(data);
  }


  
 }

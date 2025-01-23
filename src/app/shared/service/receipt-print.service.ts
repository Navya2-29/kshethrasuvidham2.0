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

  private booleanSubject = new BehaviorSubject<boolean>(false);
  booleanValue$ = this.booleanSubject.asObservable();

  setBooleanValue(value: boolean): void {
    this.booleanSubject.next(value);
  }


  private mobileNumberSubject = new BehaviorSubject<string | null>(null);
  mobileNumber$ = this.mobileNumberSubject.asObservable();

  // Set the mobile number
  setMobileNumber(number: string) {
    this.mobileNumberSubject.next(number);
  }

  // Get the latest mobile number (optional)
  getMobileNumber(): string | null {
    return this.mobileNumberSubject.getValue();
  }




  
 }

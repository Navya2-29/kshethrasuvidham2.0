import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptPrintService {

 // Use BehaviorSubject to hold and emit the data
 private dataSubject = new BehaviorSubject<any>(null);
 data$ = this.dataSubject.asObservable();

 constructor() {}

 // Method to send data
 sendData(data: any) {
   this.dataSubject.next(data);
 }
 }

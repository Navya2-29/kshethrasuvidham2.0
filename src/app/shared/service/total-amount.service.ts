import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TotalAmountService {

  constructor() { }

  private totalAmountSource = new BehaviorSubject<number>(0);
  totalAmount$ = this.totalAmountSource.asObservable();

  setTotalAmount(amount: number) {
    this.totalAmountSource.next(amount);
  }
}

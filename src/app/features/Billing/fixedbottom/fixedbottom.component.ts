import { Component, OnInit } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MobserachbtnComponent} from '../../../mobserachbtn/mobserachbtn.component';
import { TotalAmountService } from '../../../shared/service/total-amount.service';

@Component({
  selector: 'app-fixedbottom',
  standalone: true,
  imports: [MatInputModule, MatButtonModule,MobserachbtnComponent],
  templateUrl: './fixedbottom.component.html',
  styleUrl: './fixedbottom.component.css'
})
export class FixedbottomComponent implements OnInit {
  totalAmount: number;

  constructor(private totalAmountService: TotalAmountService) {}

  ngOnInit() {
    this.totalAmountService.totalAmount$.subscribe(amount => {
      this.totalAmount = amount;
    });
  }
}

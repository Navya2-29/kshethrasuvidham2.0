import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {MatSelectModule} from '@angular/material/select';
import {FormControl} from '@angular/forms';
@Component({
  selector: 'app-devotee-fee-collection',
  standalone: true,
  imports: [ MatIconModule,
      TranslateModule,
      CommonModule,
      ReactiveFormsModule,
      FormsModule,MatSelectModule],
  templateUrl: './devotee-fee-collection.component.html',
  styleUrl: './devotee-fee-collection.component.css'
})
export class DevoteeFeeCollectionComponent {
  lang: string | null;
  toppings = new FormControl('');
  toppingList: string[] = ['Jan', 'Feb', 'March', 'April', 'May', 'June',"July","Aug",'Sept',"Oct","Nov","Dec"];
  constructor(private ts: TranslateService){
    this.lang = localStorage.getItem('Language');
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }
}

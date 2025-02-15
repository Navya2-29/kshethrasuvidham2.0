import {Component, ViewChild} from '@angular/core';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {provideNativeDateAdapter} from '@angular/material/core';
import { NadavaravuComponent } from '../../../nadavaravu/nadavaravu.component';
import { OthervazhipadComponent } from '../../../othervazhipad/othervazhipad.component';
import { CreditcollectionComponent } from '../../../creditcollection/creditcollection.component';
import {MatTabsModule} from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { DevoteeFeeCollectionComponent } from '../devotee-fee-collection/devotee-fee-collection.component';
@Component({
  selector: 'app-areaothers',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatButtonModule, MatExpansionModule,DevoteeFeeCollectionComponent,TranslateModule, MatIconModule, MatFormFieldModule, MatInputModule, NadavaravuComponent, MatTabsModule,CreditcollectionComponent],
  templateUrl: './areaothers.component.html',
  styleUrl: './areaothers.component.css'
})

export class AreaothersComponent {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  lang:string |null;
  constructor( private ts: TranslateService){
    this.lang=localStorage.getItem('Language')
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }
}

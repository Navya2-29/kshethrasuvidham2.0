import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../../shared/component/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../../../services/master/master.service';
import { error } from 'pdf-lib';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-allvazhipadlist',
  standalone: true,
  imports: [HeaderComponent, SpinnerComponent, CommonModule,TranslateModule],
  templateUrl: './allvazhipadlist.component.html',
  styleUrl: './allvazhipadlist.component.css',
})
export class AllvazhipadlistComponent implements OnInit {
  loading: boolean = false;

  groupedData: { [key: string]: any[] } = {};
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  
  constructor(private service: MasterService,private ts: TranslateService,) {

    this.lang=localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');

  }

  ngOnInit(): void {
    this.getAllVazhipadListWithPrathishta();
  }
  printTable() {
    const printContents = document.getElementById('printableTable')!.outerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents; // Replace body with table HTML
    window.print();
    document.body.innerHTML = originalContents; // Restore original content
    window.location.reload(); // Reload to restore event bindings
  }

  getAllVazhipadListWithPrathishta() {
    const payLoad = {
      Type: 'AllVazhipadList',
      Code: '',
    };
    this.service.getMaster(payLoad).subscribe({
      next: (data) => {
        console.log(data);
        this.groupedData = data.reduce((acc: any, item: any) => {
          if (!acc[item.PName]) {
            acc[item.PName] = [];
          }
          acc[item.PName].push(item);
          return acc;
        }, {});
      },
      error: (error) => {},
    });
  }
}

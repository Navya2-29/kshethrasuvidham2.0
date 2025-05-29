// import { SearchByBillNumberComponent } from './../search-by-bill-number/search-by-bill-number.component';
import { MasterService } from './../../../services/master/master.service';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  QueryList,
  Type,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MobserachbtnComponent } from '../../../mobserachbtn/mobserachbtn.component';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { NotificationService } from '../../../services/notification/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { MobserachcontentsComponent } from '../mobserachcontents/mobserachcontents.component';
import { SearchByBillNumberComponent } from '../search-by-bill-number/search-by-bill-number.component';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NumberToWordsPipe } from '../../../shared/pipe/number-to-words.pipe';
@Component({
  selector: 'app-fixedbottom',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    FormsModule
  ],
  templateUrl: './fixedbottom.component.html',
  styleUrl: './fixedbottom.component.css',
  providers:[NumberToWordsPipe]
})

export class FixedbottomComponent implements OnInit {
  customerdetailsForBillingForm: FormGroup;
  totalAmount: number = 0;
  currentDate: string;
  mobileNumber: string = '';
  billNumber: string = '';
  lastBillnumber: number;
  LoggedInUserLastnumber: string;
  currentBillNumber: string;
  todayCollection: string = '0';
  printerLayOut:string | null;
  memberDevoteeCheck:boolean=false;
  @ViewChild('payButton', { static: true }) payButton!: ElementRef;
  private subscription: Subscription = new Subscription();
  private totalService = inject(TotalAmountService);
  private notiication = inject(NotificationService);
  private masterService = inject(MasterService);
  private numbertowordpipe=inject(NumberToWordsPipe);
  private escPressed: boolean = false;
  theLastBillNo: string;
  loginId: string | null = '';
  counterId: string | null = '';
  templeName: string | null = '';
  templeAddress: string | null = '';
  billType: string;
  lang:string | null;
  logo:string | null;
  templeLogoUrl: string = '';
  name:string | null;
  nakshatham:any[];
  role:string | null;
  receivedBooleanValue: boolean;
  memberId:string | null;
  private refreshSubscription!: Subscription;

  @ViewChild('phone') phoneInput!: ElementRef<HTMLInputElement>;
  @ViewChild('paymentDropdown', { static: true }) paymentDropdown!: ElementRef<HTMLSelectElement>;
  @ViewChild('address1Input', { static: true }) address1Input!: ElementRef;
  @ViewChildren('address1, address2, address3, pincode, phone, email')inputs!: QueryList<ElementRef>;
  sameDateArray:any [];
  differentDateArray:any[];
  isLockedShow: boolean = false;
  groupedArray: any[] = [];

  // inputs!: QueryList<ElementRef>;
   // 2D navigation grid
   navigationGrid = [
    [0, 3], // Address 1 -> Pincode
    [1, 4], // Address 2 -> Phone
    [2, 5], // Address 3 -> Email
  ];
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private receiptPrinrservice: ReceiptPrintService,
    private ts:TranslateService,
    private service :MasterService,
  ) {
    this.lang=localStorage.getItem('Language') || 'en';
    const userLang=navigator.language || "en";
    const languageCode=userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
    this.printerLayOut = localStorage.getItem('Printer');
    this.loginId = localStorage.getItem('LoginId');
    this.counterId = localStorage.getItem('counterId');
    this.templeName = localStorage.getItem('TempleName');
    this.templeAddress = localStorage.getItem('Address');
    this.logo=localStorage.getItem('Logo');
    this.name=localStorage.getItem('name');
    this.role=localStorage.getItem('Role');
    if(this.logo){
      this.templeLogoUrl=window.location.origin + `/assets/images/${this.logo}`;
      console.log( this.templeLogoUrl,"url img")
    }
    this.currentDate = this.getCurrentDateMMYY();
    this.getLastBillNumber();
    this.loggedInUserLastBillNumber();
    const today = this.getFormattedDate(new Date());
    console.log(this.currentBillNumber);
    this.customerdetailsForBillingForm = this.fb.group({
      BillNo: [''],
      Billdate: [today, [Validators.required]],
      Mobile: ['', [Validators.pattern('^[0-9]{10}$'),Validators.minLength(10),]],
      Address1: [''],
      Address2: [''],
      Address3: [''],
      Email: ['', [Validators.email]],
      Pincode: ['', [Validators.pattern('^[0-9]{6}$')]],
      Userid: [this.loginId],
      CounterId: [this.counterId],
      Trnsmode: ['CS'],
      Instno: [''],
      Instdate: [today],
      InstBank: [''],
      Memberid: ['0'],
      PaidStatus: ['Y'],
    });

    this.getStarData();
  }

  ngOnInit(): void {
    this.getTodayCollection();
    this.loadLogoAsBase64();
    this.totalService.totalAmount$.subscribe((amount) => {
      this.totalAmount = amount;
    });
    this.refreshSubscription = this.receiptPrinrservice.refreshData$.subscribe(() => {
      this.refreshData();
    });
    this.receiptPrinrservice.memberId$.subscribe(id => {
      this.memberId = id;
      if(Number(this.memberId)>0){
        this.customerdetailsForBillingForm.patchValue({
          Memberid:this.memberId
        })
      }else{
        this.customerdetailsForBillingForm.patchValue({
          Memberid:"0"
        })
      }
     
      console.log("Received Member ID:", this.memberId);
    });
    console.log(this.customerdetailsForBillingForm.value);
    this.subscription.add(
      this.totalService.dataSubmitted$.subscribe(() => {
        this.getLastBillNumber();
        this.loggedInUserLastBillNumber();
      })
    );
    this.subscribeToTrnsmodeChanges();
    this.printReceipt();
    // this.resetForm();
    this.cancelPrintRecipt()
   
  }

  refreshData() {
    this.customerdetailsForBillingForm.patchValue({
      Mobile:"",

    })
    this.mobileNumber="";
    this.memberDevoteeCheck=false;
    // Call your API or update logic here
  }

  cancelPrintRecipt(){
      this.receiptPrinrservice.booleanValue$.subscribe((value) => {
        this.receivedBooleanValue = value;
        if(this.receivedBooleanValue){
          this.resetForm()
        }
      });
  }


  private getCurrentDateMMYY(): string {
    const now = new Date();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const year = now.getFullYear().toString().slice(-2);
    return `${month}${year}`;
  }


  getLastBillNumber() {
    this.masterService.getLastBillNumber().subscribe({
      next: (data) => {
        console.log(data[0].billno,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        // this.lastBillnumber = data[0].billno-1
        this.lastBillnumber = data[0].billno-1
        this.isLockedShow = this.lastBillnumber < 0;
        this.theLastBillNo =
          this.lastBillnumber.toString() + '/' + this.currentDate;
        console.log(this.theLastBillNo,"last bilnumberrrrrrrrrrrrrrrrrrrrrr");
        this.currentBillNumber =
          (this.lastBillnumber).toString() + '/' + this.currentDate;
        // this.customerdetailsForBillingForm.patchValue({
        //   BillNo: this.currentBillNumber,
        // });
        // console.log(this.currentBillNumber);
      },
    });
  }

  loggedInUserLastBillNumber() {
    this.masterService.getloggedInUserLastBillNumber().subscribe({
      next: (data) => {
        console.log(data[0].billno);
        this.LoggedInUserLastnumber = data[0].billno;
        this.billNumber = this.LoggedInUserLastnumber;
        console.log(this.LoggedInUserLastnumber, 'loggedinUserdatataaaaaaa');
        // this.theLastBillNo =
        //   this.lastBillnumber.toString() + '/' + this.currentDate;
        // console.log(this.theLastBillNo);
      },
    });
  }

  printReceipt() {
    this.receiptPrinrservice.receiptData$.subscribe((data: any) => {
      if(this.printerLayOut=="laser"){
        this.printReceipts(data);
      }else if(this.printerLayOut=="inkJet"){
        this.printReceiptsinkJet(data);
      }
      else if(this.printerLayOut=="thermal"){
        this.printReceiptsThermal(data);
      }
      else if(this.printerLayOut=="dotMetrix"){
        this.printReceiptsDotmetrix(data);
      }
     else if(this.printerLayOut=="lasera5"){
      this.laserReciptPrinter(data)
     }
      this.getTodayCollection();
      console.log(data, 'printing details');
    });
}


// dotmetrix print function
printReceiptsDotmetrix(data: any) {
console.log(data,"dot metrix checkingkkkkkk");
  const { BillNo, Billdate, vazhipadinfo ,Trnsmode} = data;
  this.differentDateArray = [];
  vazhipadinfo.forEach((item:any) => {
          this.differentDateArray.push(item); 
  });

  console.log("Same Date Array:", this.sameDateArray);
  console.log("Different Date Array:", this.differentDateArray);

  if (this.differentDateArray.length > 0) {
  // Group data by Prathista, Vazhipad, and From Date
  const groupedData = this.differentDateArray.reduce((acc: any, item: any) => {
    const key = `${item.Prethista}/${item.Vazhipad}/${item.FromDate}/${item.ToDate}`;
    if (!acc[key]) {
      acc[key] = { items: [], totalQty: 0, uniqueNames: new Set(), nalBy: '', mday: '', thithi: '',mmonth:'' };
    }
    acc[key].items.push(item);
    acc[key].totalQty += parseInt(item.Qty, 10);
    acc[key].uniqueNames.add(item.Name);


  // Check if NalBy, Mday, or Thithi has data and store it
  if (item.NalBy) acc[key].nalBy = item.NalBy;
  if (item.Mday) acc[key].mday = item.Mday;
  if (item.SearchBy) acc[key].thithi = item.SearchBy;
  if (item.Mmonth) acc[key].mmonth = item.Mmonth;

    return acc;
  }, {});

  const maxRowsPerPage = 5; // Maximum rows per page
  let allReceiptsContent = '';
  // Variable to store the total amount of all pages

  Object.keys(groupedData).forEach((key) => {
    const group = groupedData[key];
    const [prathista, vazhipad, fromDate,toDate] = key.split('/');
    const items = group.items;
    let grandTotalAmount = 0;
    // Group items by Name to sum Qty and avoid repetition
    const nameGroupedItems = items.reduce((nameAcc: any, item: any) => {
      if (!nameAcc[item.Name]) {
        nameAcc[item.Name] = {
          ...item,
          Qty: 0, // Initialize Qty sum
        };
      }
      nameAcc[item.Name].Qty += parseInt(item.Qty, 10); // Sum Qty for the same Name
      return nameAcc;
    }, {});

    // Convert grouped by Name items into an array
    const uniqueNamesItems = Object.values(nameGroupedItems);

    // Split items into pages
    const pages = [];
    for (let i = 0; i < uniqueNamesItems.length; i += maxRowsPerPage) {
      pages.push(uniqueNamesItems.slice(i, i + maxRowsPerPage));
    }

    // Render each page
    pages.forEach((page, pageIndex) => {
      let receiptContent = `
       <div class="receipt-page" style="page-break-after: ${
      pageIndex < pages.length - 1 ? 'always' : 'avoid'
    };">
    <div style="position: absolute; left:3cm; top: 3cm; font-size:9pt; white-space: pre-wrap;" >പാലൂർ ശ്രീ മഹാവിഷ്ണു ക്ഷേത്രം ,തിക്കോടി </div>
          <!-- Prathista -->
          <div style="position: absolute; left: 2cm; top: 3.5cm; max-width: 8cm; font-size:9pt; white-space: pre-wrap; word-wrap: break-word;">${prathista}</div>
          <!-- Vazhipad -->
          <div style="position: absolute; left: 2cm; top:4cm; max-width: 5cm;font-size:9pt; white-space: pre-wrap;">${vazhipad}</div>
          <!-- Bill date Date -->
          <div style="position: absolute; left: 10.5cm; top: 3.5cm;font-size:9pt;">${Billdate}</div>
          <!-- bill Number -->
          <div style="position: absolute; left: 10.5cm; top: 4cm;font-size:9pt;"> ${BillNo}</div>
           <!-- vazhipad date -->
         <div style="position: absolute; left: 4.5cm; top: 9.5cm;font-size:9pt;">
  ${fromDate != toDate ? `${this.convertDateFormat(fromDate)} to ${this.convertDateFormat(toDate)}` : `${this.convertDateFormat(fromDate)}`}
</div>
${group.nalBy ? `<div style="position: absolute; left: 5.5cm; top: 8cm;font-size:6pt">- ${group.nalBy},</div>` : ''}
${group.mday ? `<div style="position: absolute; left: 5.5cm; top: 8.3cm;font-size:6pt">- ${group.mday},</div>` : ''}
${group.mmonth ? `<div style="position: absolute; left: 5.5cm; top:8.5cm;font-size:6pt">- ${group.mmonth}</div>` : ''}
${group.thithi ? `<div style="position: absolute; left: 5.5cm; top:8cm;font-size:6pt">- ${group.thithi}</div>` : ''}
 <div style="position: absolute; left: 1.5cm; top: 8.4cm;font-size:8pt">User:${this.name}(${this.getTransactionType(Trnsmode)}) ${Trnsmode=='CR'?"(Not Paid)":""}(CNTR:${this.counterId})</div>
          `
      // Render rows in the current page
      page.forEach((item: any, rowIndex: number) => {
        let rowTop = 5.6 + rowIndex * 0.5; // Adjust row spacing
        const amount = item.Qty * item.Rate;
        grandTotalAmount += amount; // Add the amount to the grand total
        receiptContent += `
          <div style="position: absolute; left: 1cm; font-size:9pt;font-weight:bold; top: ${rowTop}cm; max-width: 5.5cm; white-space: pre-wrap; word-wrap: break-word; line-height: 1.2em;">${item.Name}${item.Name2 ? `<div style="margin-top: 0.1mm;">${item.Name2}</div>` : ''}</div>
          <div style="position: absolute; left: 6.8cm;font-size:8pt;font-weight:bold; top: ${rowTop}cm;">${this.getStarbyId(item.Star)}${item.Star2 ? `<div style="margin-top: 0.1mm;">${this.getStarbyId(item.Star2)}</div>` : ''}</div>
          <div style="position: absolute; left: 9.5cm; font-size:9pt; top: ${rowTop}cm;">${item.Qty}</div>
          <div style="position: absolute; left: 10.5cm;font-size:9pt; top: ${rowTop}cm;">${item.Rate}</div>
          <div style="position: absolute; left: 11.5cm; font-size:9pt;top: ${rowTop}cm;">${amount.toFixed(2)}</div>
         <div style="position: absolute; left: 10cm; top: 9.4cm;font-size:7pt;font-weight:bold;">${this.getTimeForBill(item.VTime)}</div>
        `;
      });
      // receiptContent += `</div>`; // Close receipt page
      // allReceiptsContent += receiptContent;

      // Add grand total at the end of the page VTime
    // const grandTotalTop = 5 + page.length * 0.7 + 1; // Position it below the last row
    // <div style="position: absolute; left: 2cm; top: 8.7cm; font-weight: bold; font-size: 8pt;">
        //  ${this.numbertowordpipe.transform(grandTotalAmount)} <span> Rupees</span>
      // </div>
    receiptContent += `
      <div style="position: absolute; left: 10.5cm; top: 8.6cm; font-weight: bold; font-size: 12pt;">
         ${grandTotalAmount.toFixed(2)}
      </div>
      
    </div>`; // Close receipt page
    allReceiptsContent += receiptContent;
  });
});

  const printContent = `
  <html>
    <head>
    
      <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10pt;
            font-weight: bold;
          }
          .receipt-page {
            position: relative;
            width: 6in;
            height: 4in;
            margin: 0 auto;
            padding: 0;
            overflow: hidden;
            page-break-after: auto;
          }
        </style>
    </head>
    <body>
      ${allReceiptsContent}
    </body>
  </html>
`;
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    this.resetForm()
  }
}

}

private printReceipts(data: any) {
  const {
    BillNo,
    Billdate,
    Trnsmode,
    vazhipadinfo,
  } = data;

 

  // Group by Prathista and Vazhipad
  const groupedByPrathistaVazhipad = vazhipadinfo.reduce((acc: { [key: string]: any[] }, item: any) => {
    const key = `${item.Prethista}-${item.Vazhipad}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  let allReceiptsContent = '';
  const prathistaVazhipadKeys = Object.keys(groupedByPrathistaVazhipad);

  // Loop through grouped data
  for (let i = 0; i < prathistaVazhipadKeys.length; i++) {
    const key = prathistaVazhipadKeys[i];
    const items = groupedByPrathistaVazhipad[key];
    const [prathista, vazhipad] = key.split('-');

    // Calculate the total amount for the group
    const totalAmount = items.reduce(
      (total: number, item: any) => total + parseFloat(item.Amount || '0'),
      0
    );

    // Prepare the rows for each item in the group
    const vazhipadRows = items
      .map(
        (item: any) => `
        <tr>
          <td>${item.Name || 'N/A'}<br /><span>${item.Name2 || ' '}</span></td>
          <td>${this.getStarbyId(item.Star)}<br/><span>${this.getStarbyId(item.Star2)}</span></td>
          <td>${item.VazhipadDate || 'N/A'}</td>
          <td>${item.Qty || '0'}</td>
          <td>${item.Rate || '0'}</td>
          <td>${item.Amount || '0'}</td>
        </tr>`
      )
      .join('');

    const displayTrnsmode =
      Trnsmode.toLowerCase() === 'cr' ? 'Cash not paid' : Trnsmode;

    const receiptContent = `
      <div class="receipt-page">
        <div class="receipt-header">
          <!-- Temple Logo on the left -->
          <img src="${this.templeLogoUrl}" alt="Temple Logo" class="temple-logo" />
          
          <div class="header-text">
            <h1>${this.templeName}</h1>
            <p>${this.templeAddress}</p>
            <h2 class="receipt-heading">വഴിപാട് രസീത്</h2>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: red;">പ്രതിഷ്ഠ: ${prathista}</strong>
            <strong>തീയതി: ${Billdate || 'N/A'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: green;">വഴിപാട്: ${vazhipad}</strong>
            <strong>നമ്പർ: ${BillNo || 'N/A'}</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>പേര് </th>
                <th>നക്ഷത്രം </th>
                <th>തീയതി</th>
                <th>എണ്ണം</th>
                <th>നിരക്ക്</th>
                <th>തുക</th>
              </tr>
            </thead>
            <tbody>
              ${vazhipadRows}
              <tr>
                <td colspan="5" class="total-label"><strong>ആകെ തുക :</strong></td>
                <td class="total-amount"><strong>${totalAmount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
         <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <!-- Left side content (Counter ID and Duplicate stacked vertically) -->
            <div style="display: flex; flex-direction: column;">
                <strong style="margin-right: 15px;">Counter ID: ${
                  this.counterId
                }</strong>
                <strong>Secretory</strong>
            </div>
            <!-- Right side content (Login ID and Transaction Mode stacked vertically) -->
            <div style="display: flex; flex-direction: column;">
                <strong style="margin-right: 15px;">Login: ${
                  this.name
                }</strong>
                <strong>Payment Mode: ${this.getTransactionType(Trnsmode)}</strong>
            </div>
        </div>

          </div>
        ${i < prathistaVazhipadKeys.length - 1 ? '<div class="page-break"></div>' : ''}
      </div>`;

    allReceiptsContent += receiptContent;
  }

  // Print the receipt content
  const printContent = `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
          .receipt-page { padding: 10px; page-break-inside: avoid; }
          .receipt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
          .temple-logo { max-width: 150px; }
          .header-text { text-align: center; flex-grow: 1; }
          .receipt-heading { color: #4CAF50; margin: 10px 0; font-size: 1.5em; }
          .page-break { page-break-after: always; }
          h1 { text-align: center; color: #4CAF50; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 5px; text-align: left; }
          th { background-color: #3f51b5; color: white; }
          .total-label { text-align: right; }
          .total-amount { background-color: #e0f7fa; }
          td span { font-size: 0.85em; color: #666; }
          @media print {
            @page { margin: 0; size: A4; }
            body { margin: 10mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${allReceiptsContent}
      </body>
    </html>`;

  this.printContent(printContent);
}

private printContent(content: string) {
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close(); // Close the print window after printing
    };
    this.resetForm();
  } else {
    console.error('Failed to open the print window.');
  }

}

getTransactionType(transmode: string): string {
  console.log(transmode);
  switch (transmode) {
    case 'ON':
      if (this.lang == 'en') {
        return 'ONLINE';
      } else {
        return 'ഓൺലൈൻ';
      }

    case 'CS':
      if (this.lang == 'en') {
        return 'CASH';
      } else {
        return 'ക്യാഷ്';
      }
    case 'MO':
      if (this.lang == 'en') {
        return 'MONEY ORDER';
      } else {
        return 'മണി ഓർഡർ';
      }
    case 'UP':
      if (this.lang == 'en') {
        return 'UPI';
      } else {
        return 'യുപിഐ';
      }

    case 'CH':
      if (this.lang == 'en') {
        return 'CHEQUE';
      } else {
        return 'ചെക്ക്';
      }
    case 'CR':
      if (this.lang == 'en') {
        return 'CREDIT';
      } else {
        return 'ക്രെഡിറ്റ്';
      }
    case 'DE':
      if (this.lang == 'en') {
        return 'DEBIT';
      } else {
        return 'ഡെബിറ്റ്';
      }
    default:
      return 'OTHERS';
  }
}

  private subscribeToTrnsmodeChanges() {
    
    this.customerdetailsForBillingForm
      .get('Trnsmode')
      ?.valueChanges.subscribe((value) => {
        if (value === 'CH') {
          this.setChequeValidators();
        } else if (value === 'CR' ) {
          this.customerdetailsForBillingForm.patchValue({ PaidStatus: 'N' });
          this.clearChequeValidators();
          this.setCreditValidators();
        } 
        // else if (value === 'upi' || value === 'debit' || value === 'bank' ) {
        //   // this.customerdetailsForBillingForm.patchValue({ PaidStatus: 'N' });
        //   this.clearChequeValidators();
        //   this.clearCreditValidators();
        //   this.setUpiValidators();
        // } 
        else {
          this.clearChequeValidators();
          this.clearCreditValidators();
          this.clearUpiValidators();
        }
      });
  }

  private getFormattedDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en'); // Input type="date" expects format yyyy-MM-dd
  }

  onSubmit() {
    if (this.customerdetailsForBillingForm.invalid) {
      this.showValidationErrors();
      this.markAllFieldsAsTouched();
      return;
    }
    
    const formData = { ...this.customerdetailsForBillingForm.value };
    formData.Billdate = this.formatToDDMMYYYY(new Date(formData.Billdate));
    formData.Instdate = this.formatToDDMMYYYY(new Date(formData.Instdate));
    this.totalService.setFirstComponentData(formData);
    this.totalService.emitClickEvent();
   
  }

  private markAllFieldsAsTouched() {
    this.customerdetailsForBillingForm.markAllAsTouched();
  }

  private setChequeValidators() {
    this.customerdetailsForBillingForm
      .get('Instno')
      ?.setValidators([Validators.required,Validators.minLength(6)]);
    this.customerdetailsForBillingForm
      .get('InstBank')
      ?.setValidators([Validators.required]);
    this.customerdetailsForBillingForm
      .get('Instdate')
      ?.setValidators([Validators.required]);
    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('InstBank')
      ?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('Instdate')
      ?.updateValueAndValidity();
  }

  private clearChequeValidators() {
    this.customerdetailsForBillingForm.get('Instno')?.clearValidators();
    this.customerdetailsForBillingForm.get('InstBank')?.clearValidators();
    this.customerdetailsForBillingForm.get('Instdate')?.clearValidators();
    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('InstBank')
      ?.updateValueAndValidity();
    this.customerdetailsForBillingForm
      .get('Instdate')
      ?.updateValueAndValidity();
  }



  private showValidationErrors() {
    Object.keys(this.customerdetailsForBillingForm.controls).forEach((key) => {
      const controlErrors = this.customerdetailsForBillingForm.get(key)?.errors;
      if (controlErrors) {
        if (controlErrors['required']) {
          this.notiication.showError(`${key} is required`, 'Billing');
        }
        if (controlErrors['pattern']) {
          if (key === 'Mobile') {
            this.notiication.showError(
              'Invalid phone number. Must be 10 digits atleast.'
            );
          }
          if (key === 'Pincode') {
            this.notiication.showError('Invalid pincode. Must be 6 digits.');
          }
        }
        if (controlErrors['email']) {
          this.notiication.showError('Invalid email format.');
        }
        if (controlErrors['minLength']) {
          if (key === 'Mobile') {
            this.notiication.showError(
              'Invalid phone number. Must be 10 digits atleast.'
            );
          }
        }
      }
    });
  }

  private setCreditValidators() {
    this.customerdetailsForBillingForm
      .get('Mobile')
      ?.setValidators([Validators.required,Validators.minLength(10),Validators.pattern('^[0-9]{10}$')],);
    this.customerdetailsForBillingForm.get('Mobile')?.updateValueAndValidity();
  }


  private clearCreditValidators() {
    this.customerdetailsForBillingForm.get('Mobile')?.clearValidators();
    this.customerdetailsForBillingForm.get('Mobile')?.updateValueAndValidity();
  }


  private setUpiValidators() {
    this.customerdetailsForBillingForm
      .get('Instno')
      ?.setValidators([Validators.required]);

    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
  }


  private clearUpiValidators() {
    this.customerdetailsForBillingForm.get('Instno')?.clearValidators();
    this.customerdetailsForBillingForm.get('Instno')?.updateValueAndValidity();
  }


  private formatToDDMMYYYY(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  openDialog(data: any) {
    this.dialog.open(MobserachcontentsComponent, {
      width: '80vw', // Set the width of the dialog
      data: data,
    });
  }

  onFind() {
    if (this.mobileNumber.length !== 10) {
      // Display a toaster or any other form of error message
      this.notiication.showError('Please enter Valid Mobile number');
      return;
    }
    // Call the API to get details by mobile number
    const payLoad = { Type: 'SearchMobile', Code: this.mobileNumber };
    this.masterService.SearchByMobileNo(payLoad).subscribe({
      next: (data) => {
        console.log(data);
        this.openDialog(data);
        this.mobileNumber = '';
      },
      error: (error) => {
        // Handle error
        alert('Error fetching data. Please try again later.');
        console.error('Error fetching data:', error);
      },
    });
  }

  onFindBillNumber() {
    if (this.billNumber.length === 0) {
      // Display a toaster or any other form of error message
      this.notiication.showError('Please enter valid Bill Number');
      return;
    }
    // Call the API to get details by mobile number
    const payLoad = { Type: 'SearchBillno', Code: this.billNumber };
    this.masterService.SearchByBillNo(payLoad).subscribe({
      next: (data) => {
        console.log(data,"by bill number");
        if (data.length > 0) {
          this.openDialogBillNumber(data);
          this.billNumber = '';
        } else {
          this.notiication.showError('enter valid billnumber');
        }
      },
      error: (error) => {
        // Handle error
        alert('Error fetching data. Please try again later.');
        console.error('Error fetching data:', error);
      },
    });
  }

  openDialogBillNumber(data: any) {
    this.dialog.open(SearchByBillNumberComponent, {
      width: '90vw', // Set the width of the dialog
      data: data,
    });
  }

  resetForm() {
    this.customerdetailsForBillingForm.reset();
    const today = this.getFormattedDate(new Date());
    this.customerdetailsForBillingForm.patchValue({
      BillNo: this.lastBillnumber,
      Billdate: today,
      Userid: this.loginId,
      CounterId: this.counterId,
      Trnsmode: 'CS',
      Instno: '',
      Instdate: today,
      InstBank: '',
      Memberid: '0',
      PaidStatus: 'Y',
      Mobile: '', 
      Address1: '',
      Address2: '',
      Address3: '',
      Email: '',
      Pincode: '', 
    });
  }


  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTodayCollection() {
    const fromDate = this.formatDate(new Date());
    const payLoad={
      "Type":"TodayCollection",
      "FromDate":fromDate,
      "ToDate":fromDate,
      "PMId":this.loginId,
      "VazhId":this.counterId
    }
    console.log(payLoad,"Payload");
    this.masterService.getVazhipadWiseReport(payLoad).subscribe({
      next: (todaycollection) => {
        console.log(todaycollection);
        this.todayCollection = todaycollection[0].Amount;
      },
    });
  }

  // function to pdf
  generatePDFAndSendToWhatsApp() {
    const data = document.getElementById('bill-content');

    // Check if the bill content element is found
    if (!data) {
      console.error('Bill content not found!');
      return; // Exit if the element is not found
    }

    // Proceed with PDF generation
    html2canvas(data).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let doc = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;

      let position = 0;
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF to a Blob
      const pdfBlob = doc.output('blob');

      // Use a server endpoint to upload the PDF and get a link (you need to implement this part)
      const formData = new FormData();
      formData.append('file', pdfBlob, 'bill.pdf');

      // Example: Upload the PDF to your server (adjust URL to your server's endpoint)
      fetch('https://your-server-endpoint/upload', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          const pdfUrl = data.fileUrl; // Get the URL from your server response
          this.sendWhatsAppMessage(pdfUrl);
        })
        .catch((error) => console.error('Error uploading PDF:', error));
    });
  }

  sendWhatsAppMessage(pdfUrl: string) {
    const whatsappMessage = `Hey, here is your bill: ${pdfUrl}`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(
      whatsappMessage
    )}`;
    window.open(whatsappURL, '_blank');
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.escPressed = true;
      this.focusOnPayButton();
    }
  }

  // Function to focus on the Pay button
  focusOnPayButton(): void {
    if (this.payButton) {
      this.payButton.nativeElement.focus();
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKeyPress(event: KeyboardEvent): void {
    if (this.escPressed) {
      this.onSubmit(); // Trigger the click event of the Pay button
      this.escPressed = false; // Reset the ESC key flag
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault(); // Prevents the default browser refresh behavior
      this.focusOnAddress1();
    }
  }

  private focusOnAddress1() {
    if (this.address1Input) {
      this.address1Input.nativeElement.focus();
    }
  }


  handleKeyDowns(event: KeyboardEvent, row: number, col: number) {
    const keyMap = {
      ArrowRight: { row, col: col + 1 }, // Move right
      ArrowLeft: { row, col: col - 1 }, // Move left
      ArrowUp: { row: row - 1, col },   // Move up
      ArrowDown: { row: row + 1, col }, // Move down
    };

    const movement = keyMap[event.key as keyof typeof keyMap];
    if (movement) {
      event.preventDefault(); // Prevent default browser action
      this.focusInput(movement.row, movement.col);
    }
  }

  focusInput(row: number, col: number) {
    if (row >= 0 && row < this.navigationGrid.length && col >= 0 && col < 2) {
      const index = this.navigationGrid[row][col];
      const input = this.inputs.toArray()[index];
      input?.nativeElement.focus();
    }
  }

getStarbyId(id:string){
  console.log(id,"star id")
  if(this.lang=='en'){
    const star= this.nakshatham.find(
      (item) => item.SM_Id == id
    );
    return star ? star.SM_Name : ''; 

  }else if(this.lang=='ml'){
    const star= this.nakshatham.find(
      (item) => item.SM_Id == id
    );
    return star ? star.SM_RName : ''; 
  }
 
  // console.log(star,"sssssssssssssssss")
  
}
  



getStarData() {
  const payLoad = { Type: 'ListStar', Code: '' };
  this.service.getStarData(payLoad).subscribe((res) => {
    this.nakshatham = res;
     console.log(this.nakshatham,"sdsfsddss")
    this.nakshatham = res.map((item) => ({
      SM_Id: item.id,
      SM_Name: item.SM_NameEng,
      SM_Code: item.SM_Code,
      SM_RName: item.SM_Name,
    }));
    console.log(this.nakshatham,"stttttttttttttt")
  });
}


printReceiptsinkJet(data:any){
  const {
    BillNo,
    Billdate,
    Trnsmode,
    vazhipadinfo,
  } = data;

  // Group by Prathista, Vazhipad, and VazhipadDate
  const groupedByPrathistaVazhipadDate = vazhipadinfo.reduce((acc: { [key: string]: any[] }, item: any) => {
    const key = `${item.Prethista}-${item.Vazhipad}-${item.VazhipadDate}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  let allReceiptsContent = '';
  const prathistaVazhipadDateKeys = Object.keys(groupedByPrathistaVazhipadDate);

  // Loop through grouped data
  for (let i = 0; i < prathistaVazhipadDateKeys.length; i++) {
    const key = prathistaVazhipadDateKeys[i];
    const items = groupedByPrathistaVazhipadDate[key];
    const [prathista, vazhipad, vazhipadDate] = key.split('-');

    // Calculate the total amount for the group
    const totalAmount = items.reduce(
      (total: number, item: any) => total + parseFloat(item.Amount || '0'),
      0
    );

    // Prepare the rows for each item in the group
    const vazhipadRows = items
      .map(
        (item: any) => `
        <tr>
          <td>${item.Name || 'N/A'}<br /><span>${item.Name2 || ' '}</span></td>
          <td>${this.getStarbyId(item.Star)}<br/><span>${this.getStarbyId(item.Star2)}</span></td>
          <td>${item.Qty || '0'}</td>
          <td>${item.Rate || '0'}</td>
          <td>${item.Amount || '0'}</td>
        </tr>`
      )
      .join('');

    const receiptContent = `
       <div class="receipt-page">
    <div class="receipt-header">
      <!-- Temple Logo on the left -->
      <img src="${this.templeLogoUrl}" alt="Temple Logo" class="temple-logo" />
      
      <div class="header-text">
        <h1>${this.templeName}</h1>
        <p>${this.templeAddress}</p>
        <h2 class="receipt-heading">വഴിപാട് രസീത്</h2>
      </div>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between;">
        <strong style="color: red;">പ്രതിഷ്ഠ: ${prathista}</strong>
        <strong>തീയതി: ${Billdate || 'N/A'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <strong style="color: green;">വഴിപാട്: ${vazhipad}</strong>
        <strong>നമ്പർ: ${BillNo || 'N/A'}</strong>
      </div>
      <table>
        <thead>
          <tr>
            <th>പേര് </th>
            <th>നക്ഷത്രം </th>
           
            <th>എണ്ണം</th>
            <th>നിരക്ക്</th>
            <th>തുക</th>
          </tr>
        </thead>
        <tbody>
          ${vazhipadRows}
          <tr>
            <td colspan="4" class="total-label"><strong>ആകെ തുക :</strong></td>
            <td class="total-amount"><strong>${totalAmount.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 20px;">
        <strong>വഴിപാട് തീയതികൾ:  ${
    Array.from(new Set(items.map((item:any) => item.VazhipadDate || 'N/A'))).join(', ')
  }</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <!-- Left side content (Counter ID) -->
        <div style="display: flex; flex-direction: column;">
            <strong style="margin-right: 15px;">Counter ID: ${this.counterId}</strong>
        </div>
        <!-- Right side content (Login ID and Transaction Mode) -->
        <div style="display: flex; flex-direction: column;">
            <strong style="margin-right: 15px;">Login: ${this.name}</strong>
            <strong>Payment Mode: ${this.getTransactionType(Trnsmode)}</strong>
        </div>
      </div>
    </div>
        ${i < prathistaVazhipadDateKeys.length - 1 ? '<div class="page-break"></div>' : ''}
      </div>`;

    allReceiptsContent += receiptContent;
  }

  // Print the receipt content
  const printContent = `
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
          .receipt-page { padding: 10px; page-break-inside: avoid; }
          .receipt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
          .temple-logo { max-width: 150px; }
          .header-text { text-align: center; flex-grow: 1; }
          .receipt-heading { color: #4CAF50; margin: 10px 0; font-size: 1.5em; }
          .page-break { page-break-after: always; }
          h1 { text-align: center; color: #4CAF50; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 5px; text-align: left; }
          th { background-color: #3f51b5; color: white; }
          .total-label { text-align: right; }
          .total-amount { background-color: #e0f7fa; }
          td span { font-size: 0.85em; color: #666; }
          @media print {
            @page { margin: 0; size: A4; }
            body { margin: 10mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${allReceiptsContent}
      </body>
    </html>`;

  this.printContent(printContent);
}


convertDateFormat(dateString:string) {
  // Split the input date string by the '-' delimiter
  const [year, month, day] = dateString.split('-');
  // Return the date in 'dd-mm-yyyy' format
  return `${day}-${month}-${year}`;
}

@HostListener('document:keydown', ['$event'])
handleGlobalKeyDown(event: KeyboardEvent): void {
  if (event.key === 'F5') {
    event.preventDefault(); // Prevent the default page refresh action
    this.phoneInput.nativeElement.focus(); // Focus the phone input field
  }
  else if (event.key === 'F2') { // Replace 'F2' with the desired key
    event.preventDefault(); // Prevent default behavior for the key
    this.focusPaymentDropdown();
  }
  
}


// Function to group data by VazhipadDate
groupDataByVazhipadDate(vazhipadinfo: any[]) {
    const groupedData: { [key: string]: any[] } = {};

    vazhipadinfo.forEach(item => {
        const key = item.VazhipadDate; // Group by VazhipadDate
        if (!groupedData[key]) {
            groupedData[key] = [];
        }
        groupedData[key].push(item);
    });

    // Return as an array of groups (each group corresponds to a different VazhipadDate)
    return Object.values(groupedData);
}






printReceiptsThermal(data: any) {
  const imageUrl = window.location.origin + '/assets/images/temple-logo.png';
  const { BillNo, Billdate, vazhipadinfo, Trnsmode } = data;
  this.differentDateArray = [];
  vazhipadinfo.forEach((item: any) => {
    this.differentDateArray.push(item);
  });

  console.log("Same Date Array:", this.sameDateArray);
  console.log("Different Date Array:", this.differentDateArray);

  if (this.differentDateArray.length > 0) {
    // Group data by Prathista, Vazhipad, and From Date
    const groupedData = this.differentDateArray.reduce((acc: any, item: any) => {
      const key = `${item.Prethista}/${item.Vazhipad}/${item.FromDate}/${item.ToDate}`;
      if (!acc[key]) {
        acc[key] = { items: [], totalQty: 0, uniqueNames: new Set(), nalBy: '', mday: '', thithi: '', mmonth: '', Rate: "",VTime:'' };
      }
      acc[key].items.push(item);
      acc[key].totalQty += parseInt(item.Qty, 10);
      acc[key].uniqueNames.add(item.Name);

      // Store additional details if available
      if (item.NalBy) acc[key].nalBy = item.NalBy;
      if (item.Mday) acc[key].mday = item.Mday;
      if (item.SearchBy) acc[key].thithi = item.SearchBy;
      if (item.Mmonth) acc[key].mmonth = item.Mmonth;
      if (item.Rate) acc[key].rate = item.Rate;
      if (item.VTime) acc[key].VTime = item.VTime;
      return acc;
    }, {});

    const maxRowsPerPage = 4; // Maximum rows per page
    let allReceiptsContent = '';

    Object.keys(groupedData).forEach((key) => {
      const group = groupedData[key];
      const [prathista, vazhipad, fromDate, toDate] = key.split('/');
      const items = group.items;
      let grandTotalAmount = 0;

      // Group items by Name to sum Qty and avoid repetition
      const nameGroupedItems = items.reduce((nameAcc: any, item: any) => {
        if (!nameAcc[item.Name]) {
          nameAcc[item.Name] = {
            ...item,
            Qty: 0,
          };
        }
        nameAcc[item.Name].Qty += parseInt(item.Qty, 10);
        return nameAcc;
      }, {});

      // Convert grouped by Name items into an array
      const uniqueNamesItems = Object.values(nameGroupedItems);

      // Split items into pages
      const pages = [];
      for (let i = 0; i < uniqueNamesItems.length; i += maxRowsPerPage) {
        pages.push(uniqueNamesItems.slice(i, i + maxRowsPerPage));
      }

      // Render each page
      pages.forEach((page, pageIndex) => {
        let receiptContent = `
          <div class="receipt-page">
          <div style="text-align: center;"><img src="${imageUrl}" alt="logo" style="width: 60px; height: 60px;align-item:center;"/></div>
            <div class="receipt-header">${this.templeName}</div>
            <div class="receipt-sub-header">${this.templeAddress}</div>
            <hr>
            <div class="receipt-content receipt-contentbill">Bill Date: ${Billdate}</div>
            <div class="receipt-content">Bill No: ${BillNo}</div>
            <div class="receipt-content">Prathista: ${prathista}</div>
            <div class="receipt-content">Vazhipad: ${vazhipad}</div>
        `;

        // Render rows in the current page
        page.forEach((item: any) => {
          const amount = item.Qty * item.Rate;
          grandTotalAmount += amount; // Add the amount to the grand total
          receiptContent += `
            <div class="receipt-content">Name: ${item.Name}</div>
            ${item.Name2 ? `<div class="receipt-content">Name2: ${item.Name2}</div>` : ''}
            <div class="receipt-content">Star: ${this.getStarbyId(item.Star)}</div>
            ${item.Star2 ? `<div class="receipt-content">Star2: ${this.getStarbyId(item.Star2)}</div>` : ''}
          `;
        });

        // Add grand total and other details
        receiptContent += `
            <div class="receipt-rq">Rate: ${group.rate}</div>
            <div class="receipt-rq">Total Qty: ${group.totalQty}</div>
            <div class="receipt-total">Total Amount: ${grandTotalAmount.toFixed(2)}</div>
            <div class=receipt-contents">    
             
         ${this.numbertowordpipe.transform(grandTotalAmount)}<span>Rupees</span>
      
            
            </div>
            <div class="receipt-content-vd">Vazhipad Date: 
              ${fromDate !== toDate ? `${this.convertDateFormat(fromDate)} to ${this.convertDateFormat(toDate)}` : `${this.convertDateFormat(fromDate)}`}
            </div>
            
           
            <div>
             ${group.VTime ? `
    <div class="receipt-content-vd">Vazhipad Time: 
      ${this.getTimeForBill(group.VTime)}
    </div>
  ` : ''}
  ${group.thithi ? `<div class="receipt-footer">Thithi : ${group.thithi}</div>` : ''}
            ${group.nalBy ? `<div class="receipt-footer">Star: ${group.nalBy}</div>` : ''}
            ${group.mday ? `<div class="receipt-footer">Day: ${group.mday}</div>` : ''}
            ${group.mmonth ? `<div class="receipt-footer">Month: ${group.mmonth}</div>` : ''}</div>
            <div class="receipt-footer-ut">
              User: ${this.name} 
            </div>
             <div class="receipt-footer-ut">
              Counter:${this.counterId}
            </div>
             <div class="receipt-footer-ut">
              Payment Mode:  ${this.getTransactionType(Trnsmode)}, ${Trnsmode=='CR'?"Not Paid":""}
            </div>
           <div><p>www.cubixsystems.com</p></div>
          </div> <!-- Close receipt-page -->
        `;
        allReceiptsContent += receiptContent;
      });
    });

    // Final print content with styling
    const printContent = `
      <html>
        <head>
          <style>
            body {
              margin: 10px;
              padding: 0;
              
             
              
              text-align: left;
            }

            .receipt-page {
              position: relative;
              width: 80mm;;
              height: auto;
              margin: 0 auto;
              padding: 10px;
              overflow: hidden;
              page-break-after: auto;
              // border: 1px dashed #000;
              
            }

            .receipt-header {
              font-size: 12pt;
              font-weight: bold;
              text-align: center;
              margin-bottom: 2px;
              font-family:Manjari;
            }

            .receipt-sub-header {
              font-size: 6pt;
              text-align: center;
              margin-bottom: 5px;
              font-family:Manjari;
              // font-weight: bold;
            }

            hr {
              border: 0;
              border-top: 1px dashed black;
              margin: 8px 0px;
            }
              .receipt-contentbill{
              margin-top:10px;
              }

            .receipt-content {
              text-align: left;
              font-size: 12pt;
              margin-bottom: 5px;
              margin-top:10px;
              margin-top:5px;
              font-family:Manjari;
              font-weight: bold;
            }
              .receipt-content-vd{
              text-align: left;
              font-size: 12pt;
              margin-bottom: 10px;
              margin-top:10px;
              
              font-family:Manjari;
              font-weight: bold;
              }
               .receipt-contents {
              text-align: left;
              font-size: 10pt;
              
              margin-top:10px;
              font-family:Manjari;
            }

            .receipt-total {
              margin-top: 10px 0px;
               margin-bottom: 10px 0px;
              font-weight: bold;
              font-size: 12pt;
              border-top: 1px solid #000;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              padding-top: 10px;
              text-align: left;
            }
           .receipt-rq{
            margin-top: 10px;
              font-weight: bold;
              font-size: 11pt;
              
              // padding-top: 5px;
              text-align: left;
            }
              .receipt-footer-ut{
              font-size: 9pt;
              margin-top: 2px;
              font-style: italic;
              text-align: left;
              }
            .receipt-footer {
              font-size: 9pt;
              margin-top: 3px;
              font-style: italic;
              text-align: left;
            }
          </style>
        </head>
        <body>
          ${allReceiptsContent}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
          this.resetForm();
        }, 500); // small delay to ensure image is loaded
      };
    }
  }
}


focusPaymentDropdown(): void {
  if (this.paymentDropdown?.nativeElement) {
    this.paymentDropdown.nativeElement.focus();
  }
}

getNameAndStarByMobilenumber(){

 console.log(this.mobileNumber,"mobile number data");

console.log(this.memberDevoteeCheck,"dsssssssssssssss");
 if(this.mobileNumber){
  // this.masterService.getMaster
  this.customerdetailsForBillingForm.patchValue({
    Mobile:this.mobileNumber
  })
  const data={
    mobile:this.mobileNumber,
    member:this.memberDevoteeCheck
  }
  this.receiptPrinrservice.setMobileNumber(data);
  console.log('Mobile number sent:', this.mobileNumber);
 
 }else{
  this.notiication.showError("Please enter the valid mobile number and try again");
}

}



onPayFocus() {
  document.getElementById('paybutton')?.classList.add('paybuttonhg');
}

onPayBlur() {
  document.getElementById('paybutton')?.classList.remove('paybuttonhg');
}


getdevoteeDetailsforBiling(){

}


 
  laserReciptPrinter(data: any) {
    console.log(data,"laser print checking");
      const { BillNo, Billdate, vazhipadinfo ,Trnsmode} = data;
      this.differentDateArray = [];
      vazhipadinfo.forEach((item:any) => {
              this.differentDateArray.push(item); 
      });
    
      console.log("Same Date Array:", this.sameDateArray);
      console.log("Different Date Array:", this.differentDateArray);
    
      if (this.differentDateArray.length > 0) {
      // Group data by Prathista, Vazhipad, and From Date
      const groupedData = this.differentDateArray.reduce((acc: any, item: any) => {
        const key = `${item.Prethista}/${item.Vazhipad}/${item.FromDate}/${item.ToDate}`;
        if (!acc[key]) {
          acc[key] = { items: [], totalQty: 0, uniqueNames: new Set(), nalBy: '', mday: '', thithi: '',mmonth:'' };
        }
        acc[key].items.push(item);
        acc[key].totalQty += parseInt(item.Qty, 10);
        acc[key].uniqueNames.add(item.Name);
    
    
      // Check if NalBy, Mday, or Thithi has data and store it
      if (item.NalBy) acc[key].nalBy = item.NalBy;
      if (item.Mday) acc[key].mday = item.Mday;
      if (item.SearchBy) acc[key].thithi = item.SearchBy;
      if (item.Mmonth) acc[key].mmonth = item.Mmonth;
    
        return acc;
      }, {});
    
      const maxRowsPerPage = 6; // Maximum rows per page
      let allReceiptsContent = '';
      // Variable to store the total amount of all pages
    
      Object.keys(groupedData).forEach((key) => {
        const group = groupedData[key];
        const [prathista, vazhipad, fromDate,toDate] = key.split('/');
        const items = group.items;
        let grandTotalAmount = 0;
        // Group items by Name to sum Qty and avoid repetition
        const nameGroupedItems = items.reduce((nameAcc: any, item: any) => {
          if (!nameAcc[item.Name]) {
            nameAcc[item.Name] = {
              ...item,
              Qty: 0, // Initialize Qty sum
            };
          }
          nameAcc[item.Name].Qty += parseInt(item.Qty, 10); // Sum Qty for the same Name
          return nameAcc;
        }, {});
    
        // Convert grouped by Name items into an array
        const uniqueNamesItems = Object.values(nameGroupedItems);
    
        // Split items into pages
        const pages = [];
        for (let i = 0; i < uniqueNamesItems.length; i += maxRowsPerPage) {
          pages.push(uniqueNamesItems.slice(i, i + maxRowsPerPage));
        }
    
        // Render each page
        pages.forEach((page, pageIndex) => {
          let grandTotalAmount = 0;
  
          let receiptContent = `
           <div class="receipt-page" style="${pageIndex < pages.length - 1 ? 'page-break-after: always;' : ''}">
              <!-- Header with logo and temple info -->
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <img src="${this.templeLogoUrl}" alt="Temple Logo" style="height: 60px; margin-right: 10px;">
                <div style="font-size: 11pt;">
                  <div style="text-align:center;"><strong>${this.templeName}</strong></div>
                  <div style="text-align:center;">${this.templeAddress}</div>
                 
                </div>
              </div>
  
              <!-- Receipt Header Info (Left/Right Split) -->
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 10pt;">
                <div>
                  <div><strong>Prathista:</strong> ${prathista}</div>
                  <div><strong>Vazhipad:</strong> ${vazhipad}</div>
                </div>
                <div style="text-align: right;">
                  <div><strong>Bill No:</strong> ${BillNo}</div>
                  <div><strong>Bill Date:</strong> ${Billdate}</div>
                </div>
              </div>
  
              <!-- Date Range -->
              <div style="margin-bottom: 10px; font-size: 10pt;">
                <strong>Vazhipad Date:</strong> ${fromDate != toDate ? `${this.convertDateFormat(fromDate)} to ${this.convertDateFormat(toDate)}` : `${this.convertDateFormat(fromDate)}`}<br>
                ${group.nalBy ? `<strong>Nal By:</strong> ${group.nalBy}<br>` : ''}
                ${group.mday ? `<strong>Mday:</strong> ${group.mday}<br>` : ''}
                ${group.mmonth ? `<strong>Mmonth:</strong> ${group.mmonth}<br>` : ''}
              </div>
  
              <!-- Table -->
              <table style="width: 100%; border-collapse: collapse; font-size: 10pt;" border="1">
                <thead>
                  <tr>
                    <th style="padding: 4px;">Name</th>
                    <th style="padding: 4px;">Star</th>
                    <th style="padding: 4px;">Qty</th>
                    <th style="padding: 4px;">Rate</th>
                    <th style="padding: 4px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
          `;
  
          page.forEach((item: any) => {
            const amount = item.Qty * item.Rate;
            grandTotalAmount += amount;
  
            receiptContent += `
              <tr>
                <td style="padding: 4px;">${item.Name}${item.Name2 ? `<br>${item.Name2}` : ''}</td>
                <td style="padding: 4px;">${this.getStarbyId(item.Star)}${item.Star2 ? `<br>${this.getStarbyId(item.Star2)}` : ''}</td>
                <td style="padding: 4px; text-align:center;">${item.Qty}</td>
                <td style="padding: 4px; text-align:right;">${item.Rate}</td>
                <td style="padding: 4px; text-align:right;">${amount.toFixed(2)}</td>
              </tr>
            `;
          });
  
          receiptContent += `
                </tbody>
              </table>
  
              <div style="margin-top: 5px; font-weight: bold; text-align: right;">
                Grand Total: ₹${grandTotalAmount.toFixed(2)}
              </div>
              <div style="margin-top: 5px; font-style: italic;">
                In Words: ${this.numbertowordpipe.transform(grandTotalAmount)} Rupees
              </div>
            </div> <!-- End of receipt-page -->
          `;
  
          allReceiptsContent += receiptContent;
        });
        
    });
    
      const printContent = `
      <html>
        <head>
        
          <style>
             body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 10pt;
            }
            .receipt-page {
              position: relative;
              width:210mm;
              height: 148mm; 
              margin: 0 auto;
              padding:0 10mm;
              box-sizing: border-box;
              overflow: hidden;
              page-break-after: auto;
              border: 1px solid #ccc;
            }
            table, th, td {
              border: 1px solid black;
            }
          </style>
        </head>
        <body>
          ${allReceiptsContent}
        </body>
      </html>
    `;
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        this.resetForm()
      }
    }
    
    }




    loadLogoAsBase64() {
      fetch('assets/images/temple-logo.png') // this path is correct
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.templeLogoUrl = reader.result as string; // Base64 encoded string
          };
          reader.readAsDataURL(blob);
        });
    }


    getTimeForBill(time:string){
     
      switch (time.toString()) {
        case '0':
          if (this.lang == 'en') {
            return 'Any Time';
          } else {
            return 'എപ്പോൾ വേണമെങ്കിലും';
          }
  
        case '1':
          if (this.lang == 'en') {
            return 'Morning';
          } else {
            return 'രാവിലെ';
          }
        case '2':
          if (this.lang == 'en') {
            return 'Evening';
          } else {
            return 'വൈകുന്നേരം';
          }
        case '3':
          if (this.lang == 'en') {
            return 'Night';
          } else {
            return 'രാത്രി';
          }
  
        
       
        default:
          return ' ';
      }
        
  }

}

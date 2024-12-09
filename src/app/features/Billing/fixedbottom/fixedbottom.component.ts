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
@Component({
  selector: 'app-fixedbottom',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,

    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    FormsModule,
  ],
  templateUrl: './fixedbottom.component.html',
  styleUrl: './fixedbottom.component.css',
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
  @ViewChild('payButton', { static: true }) payButton!: ElementRef;
  private subscription: Subscription = new Subscription();
  private totalService = inject(TotalAmountService);
  private notiication = inject(NotificationService);
  private masterService = inject(MasterService);
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
  @ViewChild('address1Input', { static: true }) address1Input!: ElementRef;
  @ViewChildren('address1, address2, address3, pincode, phone, email')
  inputs!: QueryList<ElementRef>;
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
    if(this.logo){
      console.log( this.templeLogoUrl)
      this.templeLogoUrl=`assets/images/${this.logo}`;
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
      Memberid: ['1'],
      PaidStatus: ['Y'],
    });

    this.getStarData();
  }

  ngOnInit(): void {
    this.getTodayCollection();
   
    this.totalService.totalAmount$.subscribe((amount) => {
      this.totalAmount = amount;
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
        this.lastBillnumber = data[0].billno-1
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
      if(this.printerLayOut=="Normal"){
        this.printReceipts(data);
      }else if(this.printerLayOut=="inkJet"){
        this.printReceiptsinkJet(data);
      }
      else if(this.printerLayOut=="thermal"){
        this.printReceiptsThermal(data);
      }
     
      this.getTodayCollection();
      console.log(data, 'printing details');
    });
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
      return 'Bank';
    case 'CS':
      return 'CASH';
    case 'MO':
      return 'MONEY ORDER';
    case 'UP':
      return 'UPI';
    case 'CH':
      return 'CHEQUE';
    case 'CR':
      return 'Cash not paid';
      
    case 'DE':
      return 'DEBIT';

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
        console.log(data);
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
      width: '80vw', // Set the width of the dialog
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
      Memberid: '1',
      PaidStatus: 'Y',
      Mobile: '', 
      Address1: '',
      Address2: '',
      Address3: '',
      Email: '',
      Pincode: '', 
    });
  }

  getTodayCollection() {
    this.masterService.getTodaycollection().subscribe({
      next: (todaycollection) => {
        console.log(todaycollection);
        this.todayCollection = todaycollection[0].Total;
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
  const { BillNo, Billdate } = data;
    
    // Group data by VazhipadDate
    const groupedData = this.groupDataByVazhipadDate(data.vazhipadinfo);

    // Loop through the grouped data to generate multiple receipts
    groupedData.forEach(group => {
        const firstItem = group[0];
        let totalAmount = 0;
        let totalQty = 0;

        // Calculate total amount and quantity for the current group
        group.forEach(item => {
            totalAmount += parseFloat(item.TotalAmt);
            totalQty += parseInt(item.Qty);
        });

        // Generate rows for the receipt
        let rows = '';
        group.forEach((item, index) => {
            const offset = 160 + index * 20;
            rows += `
                <div class="field name" style="top: ${offset}px; left: 50px;">${item.Name}</div>
                <div class="field star" style="top: ${offset}px; left: 150px;">${item.Star}</div>
                <div class="field quantity" style="top: ${offset}px; left: 250px;">${item.Qty}</div>
                <div class="field rate" style="top: ${offset}px; left: 350px;">${item.Rate}</div>
                <div class="field amount" style="top: ${offset}px; left: 450px;">${item.TotalAmt}</div>
            `;
        });

        // Generate the content for the receipt
        const printContent = `
            <html>
                <head>
                    <title>Receipt</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            position: relative;
                            width: 576px;
                            height: 384px;
                        }
                        .field {
                            position: absolute;
                            font-size: 12px;
                            white-space: nowrap;
                        }
                        @media print {
                            @page { size: 6in 4in; margin: 0; }
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <!-- Bill Header -->
                    <div class="field bill-no" style="top: 20px; left: 50px;">${BillNo}</div>
                    <div class="field bill-date" style="top: 20px; left: 400px;">${Billdate}</div>

                    <!-- Dynamic Grouped Data for Each Receipt -->
                    <div class="field vazhipad" style="top: 100px; left: 50px;">${firstItem.Vazhipad}</div>
                    <div class="field prathista" style="top: 100px; left: 250px;">${firstItem.Prethista}</div>
                    <div class="field total-quantity" style="top: 120px; left: 450px;">${totalQty}</div>
                    <div class="field total-amount" style="top: 140px; left: 450px;">₹${totalAmount.toFixed(2)}</div>

                    <!-- Table Headers -->
                    <div class="field name-header" style="top: 160px; left: 50px;">Name</div>
                    <div class="field star-header" style="top: 160px; left: 150px;">Star</div>
                    <div class="field quantity-header" style="top: 160px; left: 250px;">Quantity</div>
                    <div class="field rate-header" style="top: 160px; left: 350px;">Rate</div>
                    <div class="field amount-header" style="top: 160px; left: 450px;">Amount</div>

                    <!-- Dynamic Rows of Data -->
                    ${rows}

                    <!-- Vazhipad Date at the Bottom -->
                    <div class="field vazhipad-date" style="top: ${160 + group.length * 20 + 20}px; left: 50px;">Vazhipad Date: ${firstItem.VazhipadDate}</div>
                </body>
            </html>
        `;

        // Print the current receipt
        this.printContent(printContent);
    });
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




printReceiptsThermal(data:any){

}

}

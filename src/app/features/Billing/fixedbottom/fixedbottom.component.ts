import { MasterService } from './../../../services/master/master.service';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  Type,
  ViewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MobserachbtnComponent } from '../../../mobserachbtn/mobserachbtn.component';
import { TotalAmountService } from '../../../shared/service/total-amount.service';
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
    MobserachbtnComponent,
    ReactiveFormsModule,
    CommonModule,
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
  @ViewChild('payButton', { static: true }) payButton!: ElementRef;
  private subscription: Subscription = new Subscription();
  private totalService = inject(TotalAmountService);
  private notiication = inject(NotificationService);
  private masterService = inject(MasterService);
  private escPressed: boolean = false;
  theLastBillNo: string;
  loginId: string | null = '';
  counterId: string | null = '';
  @ViewChild('address1Input', { static: true }) address1Input!: ElementRef;
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private receiptPrinrservice: ReceiptPrintService
  ) {
    this.loginId = localStorage.getItem('LoginId');
    this.counterId = localStorage.getItem('counterId');
    this.currentDate = this.getCurrentDateMMYY();
    this.getLastBillNumber();
    this.loggedInUserLastBillNumber();
    const today = this.getFormattedDate(new Date());
    console.log(this.currentBillNumber);
    this.customerdetailsForBillingForm = this.fb.group({
      BillNo: [''],
      Billdate: [today, [Validators.required]],
      Mobile: ['', [Validators.pattern('^[0-9]{10}$')]],
      Address1: [''],
      Address2: [''],
      Address3: [''],
      Email: ['', [Validators.email]],
      Pincode: ['', [Validators.pattern('^[0-9]{6}$')]],
      Userid: [this.loginId],
      CounterId: [this.counterId],
      Trnsmode: ['cs'],
      Instno: [''],
      Instdate: [today],
      InstBank: [''],
      Memberid: ['1'],
    });
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
        console.log(data[0].billno);
        this.lastBillnumber = data[0].billno;
        this.theLastBillNo =
          this.lastBillnumber.toString() + '/' + this.currentDate;
        console.log(this.theLastBillNo);
        this.currentBillNumber =
          (this.lastBillnumber + 1).toString() + '/' + this.currentDate;
        this.customerdetailsForBillingForm.patchValue({
          BillNo: this.currentBillNumber,
        });
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
    this.receiptPrinrservice.receiptData$.subscribe((data) => {
      this.printReceipts(data);
      this.getTodayCollection();
      console.log(data, 'printing details');
    });
  }

  private printReceipts(data: any) {
    const {
      BillNo,
      Billdate,
      Trnsmode,
      Mobile,
      Address1,
      Address2,
      Address3,
      Email,
      Pincode,
      vazhipadinfo,
    } = data;

    const starNameMapping = {
      '1': 'ASWATHY',
      '2': 'BHARANI',
      '3': 'KARTHIKA',
      '4': 'ROHINI',
      '5': 'MAKAYIRAM',
      '6': 'THIRUVATHIRA',
      '7': 'PUNARTHAM',
      '8': 'POOYAM',
      '9': 'AYILYAM',
      '10': 'MAKAM',
      '11': 'POORAM',
      '12': 'UTHRAM',
      '13': 'ATHAM',
      '14': 'CHITHIRA',
      '15': 'CHOTHI',
      '16': 'VISHAKAM',
      '17': 'ANIZHAM',
      '18': 'THRIKKETTA',
      '19': 'MOOLAM',
      '20': 'POORADAM',
      '21': 'UTHRADAM',
      '22': 'THIRUVONAM',
      '23': 'AVITTAM',
      '24': 'CHATHAYAM',
      '25': 'PURUTTATHI',
      '26': 'UTHRITTATHI',
      '27': 'REVATHI',
      '28': 'OHM',
    };

    const groupedByPrathistaVazhipad = vazhipadinfo.reduce(
      (acc: any, item: any) => {
        const key = `${item.Prethista}-${item.Vazhipad}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {}
    );

    let allReceiptsContent = '';
    const prathistaVazhipadKeys = Object.keys(groupedByPrathistaVazhipad);

    for (let i = 0; i < prathistaVazhipadKeys.length; i++) {
      const key = prathistaVazhipadKeys[i];
      const items = groupedByPrathistaVazhipad[key];
      const [prathista, vazhipad] = key.split('-');

      const totalAmount = items.reduce(
        (total: number, item: any) => total + parseFloat(item.Amount || '0'),
        0
      );

      const vazhipadRows = items
        .map(
          (item: any) => `
          <tr>
            <td>${item.Name || 'N/A'}<p>${item.Name2 || ' '}</p></td>
            <td>${
              starNameMapping[item.Star as keyof typeof starNameMapping] || ' '
            }<p>${
            starNameMapping[item.Star2 as keyof typeof starNameMapping] || ' '
          }</p></td>
          <td>${item.VazhipadDate || 'N/A'}</td>
            <td>${item.Qty || '0'}</td>
            <td>${item.Rate || '0'}</td>
            <td>${item.Amount || '0'}</td>
          </tr>`
        )
        .join('');
      const displayTrnsmode =
        Trnsmode.toLowerCase() === 'credit' ? 'Cash not paid' : Trnsmode;
      const receiptContent = `
        <div class="receipt-page">
          <h1>Koduvayur Sree Subrahmanya Swami Kshethram</h1>
          <div>
            <div style="display: flex; justify-content: space-between;">
            <strong style="color: green;">Vazhipad: ${vazhipad}</strong>
              <strong>Bill Date: ${Billdate || 'N/A'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
            
              <strong style="color: red;">Prathista: ${prathista}</strong>
               <strong>Bill No: ${BillNo || 'N/A'}</strong>
              
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Star</th>
                  <th>Date</th>
                  <th>Qty</th>
                  
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${vazhipadRows}
                <tr>
                  <td colspan="5" class="total-label"><strong>Total Amount:</strong></td>
                  <td class="total-amount"><strong>${totalAmount.toFixed(
                    2
                  )}</strong></td>
                </tr>
              </tbody>
            </table>
<div style="text-align: right; margin-top: 20px;">
        <strong>Login ID: ${this.loginId}</strong><br />
        <strong>Transaction Mode: ${displayTrnsmode}</strong>
      </div>


          </div>
          ${
            i < prathistaVazhipadKeys.length - 1
              ? '<div class="page-break"></div>'
              : ''
          }
        </div>`;
      allReceiptsContent += receiptContent;
    }

    const printContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
            .receipt-page { padding: 10px; page-break-inside: avoid; }
            .page-break { page-break-after: always; }
            h1 { text-align: center; color: #4CAF50; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 5px; text-align: left; }
            th { background-color: #3f51b5; color: white; }
            .total-label { text-align: right; }
            .total-amount { background-color: #e0f7fa; }
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
    } else {
      console.error('Failed to open the print window.');
    }
  }

  private subscribeToTrnsmodeChanges() {
    const mobileControl = this.customerdetailsForBillingForm.get('Mobile');
    this.customerdetailsForBillingForm
      .get('Trnsmode')
      ?.valueChanges.subscribe((value) => {
        if (value === 'cheque') {
          this.setChequeValidators();
        } else if (value === 'credit') {
          this.clearChequeValidators();
          mobileControl?.setValidators([Validators.required]); // Set as required
        } else {
          this.clearChequeValidators();
          mobileControl?.clearValidators();
          mobileControl?.setValidators([Validators.pattern('^[0-9]{10}$')]);
        }
      });
    mobileControl?.updateValueAndValidity();
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
    // const newBillNo = this.generateBillNumber();
    // this.customerdetailsForBillingForm.patchValue({ BillNo: newBillNo });
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
      ?.setValidators([Validators.required]);
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
          this.notiication.showError(`${key} is required`, 'Validation Error');
        }
        if (controlErrors['pattern']) {
          if (key === 'Mobile') {
            this.notiication.showError(
              'Invalid phone number. Must be 10 digits.'
            );
          }
          if (key === 'Pincode') {
            this.notiication.showError('Invalid pincode. Must be 6 digits.');
          }
        }
        if (controlErrors['email']) {
          this.notiication.showError('Invalid email format.');
        }
      }
    });
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
      BillNo: this.lastBillnumber + 1,
      Billdate: today,
      Userid: this.loginId,
      CounterId: '1',
      Trnsmode: 'cs',
      Instno: '',
      Instdate: today,
      InstBank: '',
      Memberid: '1',
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
}

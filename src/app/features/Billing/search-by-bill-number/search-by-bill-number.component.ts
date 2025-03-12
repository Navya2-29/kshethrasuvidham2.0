import { Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CancelBillRemarkComponent } from '../cancel-bill-remark/cancel-bill-remark.component';
import { NotificationService } from '../../../services/notification/notification.service';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface Data {
  vazhipad: string;
  name: string;
  rate: number;
  qty: number;
  amount: number;
  star: string;
  diety: string;
  time: string;
  position: number;
}


interface Entry {
  Name: string;
  Star: string;
  Rate: number;
  Amount: number;
}

interface GroupedData {
  [prathista: string]: {
    [vazhipad: string]: Entry[];
  };
}



@Component({
  selector: 'app-search-by-bill-number',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatCheckboxModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule, 
    MatInputModule, 
    MatFormFieldModule,
    TranslateModule,
    ReactiveFormsModule,

  ],
  templateUrl: './search-by-bill-number.component.html',
  styleUrl: './search-by-bill-number.component.css',
})
export class SearchByBillNumberComponent {
  displayedColumns: string[] = [
    'Diety',
    'Vazhipad',
    'Name',
    'Star',
    'Date',
    'Qty',
    'Rate',
    'Amount',
    'Actions',
  ];
  dataSource: MatTableDataSource<Data>;
  lastBillNo: any;
  TrnStatus: string;
  starData: { [id: string]: string } = {};
  duplicatebilldata: any;
  billdata: any;
  role: string | null;
  loginId: string | null;
  displayTrnsmode: string;
  counterId: string | null;
  templeName: string | null;
  nakshatham: any[];
  logo: string | null;
  name:string | null;
  updateTransMode:FormGroup;
  gropedData: GroupedData = {};
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  cancellationReason: string = '';
  templeAddress: string | null;
  lang: string | null;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  remarkDialogRef: MatDialogRef<any>;
  differentDateArray:any[]
  printerType:string |null;
  billDate:any;
  InstaNo:string;
  InstaDate:string;
  InstaBank:string;
  MobileNo:string;
  CounterId:String;
  userName:string;
  constructor(
    public dialogRef: MatDialogRef<SearchByBillNumberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private masterService: MasterService,
    private notification: NotificationService,
    private dialog: MatDialog,
    private fb:FormBuilder,
   private ts: TranslateService,
  ) {
    this.lastBillNo = data[0].BillNo;
    this.billDate=this.convertDateFormat(data[0].BillDate);
    this.TrnStatus = data[0].TrnStatus;
    this.displayTrnsmode = data[0].TrnsMode;
    this.duplicatebilldata = data;
    this. InstaNo=data[0].InstNo;
    this.InstaDate=data[0].InstDate;
      this.InstaBank=data[0].InstBank;
      this.MobileNo=data[0].MobileNo;
      this.CounterId=data[0].CounterId;
      this.userName=data[0].UName
    console.log(this.duplicatebilldata,"dupicate bill data first");
    this.dataSource = new MatTableDataSource(this.duplicatebilldata);
    this.role = localStorage.getItem('Role');
    this.loginId = localStorage.getItem('LoginId');
    this.counterId = localStorage.getItem('counterId');
    this.templeName = localStorage.getItem('TempleName');
    this.logo = localStorage.getItem('Logo');
    this.templeAddress = localStorage.getItem('Address');
    this.lang = localStorage.getItem('Language');
    this.printerType=localStorage.getItem('Printer');
    this.name=localStorage.getItem('name');


    // this.lang=localStorage.getItem('Language');
    // this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    // this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address'; 
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');

}

  ngOnInit() {
    this.loadStarData();
this.groupDataByPrathistaAndVazhipad()
    console.log(this.TrnStatus,"transmode");
    this.updateTransMode=this.fb.group({
 
      InstaNo:[this.InstaNo],
      InstaDate:[this.convertToDateFormatyyymmdd(this.InstaDate)],
      InstaBank:[this.InstaBank],
      Trnsmode:[this.displayTrnsmode],
      PaidStatus:['Y'],
      MobileNo:[this.MobileNo]
    })
    // this.getStarData();
    this.subscribeToTrnsmodeChanges()
  }

  getNakshthram(id: string): string {
    return this.starData[id] || 'Unknown'; // Return 'Unknown' if ID not found
  }

  loadStarData(): void {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterService.getStarData(payLoad).subscribe({
      next: (data: any[]) => {
        console.log(data);
        this.nakshatham = data; // Specify that data is an array of Star
        this.starData = data.reduce(
          (acc: { [id: string]: string }, star: any) => {
            acc[star.id] = star.SM_NameEng;
            return acc;
          },
          {}
        );

        console.log('Star Data Loaded:', this.starData); // Debug log
      },
      error: (err) => {
        console.error('Error loading star data:', err);
      },
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getTotalAmount(): number {
    const total = this.dataSource.data.reduce(
      (total, item) => total + (item.amount || 0),
      0
    );
    console.log('Total Amount:', total);
    return total;
  }

  cancellTheBill() {
    this.openCancelRemarkDialog();
  }

  // cancel reason dialog

  openCancelRemarkDialog() {
    const remarkDialogRef = this.dialog.open(CancelBillRemarkComponent, {
      width: '400px',
      data: { reason: this.cancellationReason }, // You can pass data to the new component here
    });

    remarkDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cancellationReason = result; // Update the cancellationReason with the value from the dialog
        console.log('Updated Cancellation Reason:', this.cancellationReason);
        this.OnCancelSubmit();
      } else {
        console.log('Dialog was closed without submitting the reason.');
      }
    });
  }

  searchBillNumber() {
    const payLoad = { Type: 'SearchBillno', Code: this.lastBillNo };
    this.masterService.SearchByBillNo(payLoad).subscribe({
      next: (data) => {
        console.log(data, 'hhhhhhhhhhhhhhhhhhhhhhhhh');
        if (data.length > 0) {
          this.billdata = data;
          console.log(this.billdata,"billdatataa")
          this.TrnStatus = data[0].TrnStatus;
          this.dataSource = new MatTableDataSource(this.billdata);
        } else {
          // this.notiication.showError('enter valid billnumber');
        }
      },
      error: (error) => {
        // Handle error
        alert('Error fetching data. Please try again later.');
        console.error('Error fetching data:', error);
      },
    });
  }

  OnCancelSubmit() {
    this.cancellationReason;
    console.log(this.cancellationReason, 'cancellarion reason');

    const payLoad = {
      Type: 'Booking',
      BillNo: this.lastBillNo,
      CancelBy: this.loginId,
      Remarks: this.cancellationReason,
    };
    console.log(payLoad, 'payload');
    this.masterService.cancellBill(payLoad).subscribe({
      next: (data: any) => {
        if (data.RespStatus === 'U') {
          console.log(data, 'cancel bill response');
          if (this.remarkDialogRef) {
            this.remarkDialogRef.close(); // This will close only the remark popup
          }
          this.searchBillNumber();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onProceed() {
    console.log('Proceed button clicked');
    // Set the bill data in the service
    // thi/s.printService.setBillData(this.duplicatebilldata);

    // Emit the event to notify PrintComponent
    // this.printService.triggerProceedEvent();
    if (this.TrnStatus === 'S') {
      console.log(this.duplicatebilldata);

      const payLoad = {
        BillNo: this.lastBillNo,
        UserId: this.loginId,
        CounterId: this.counterId,
        Type: 'Booking',
      };

      console.log(payLoad);
      this.masterService.duplicateCount(payLoad).subscribe((data) => {
        console.log(data, 'dupi');
        // this.printReceipts(this.duplicatebilldata);
        this.printDuplicateBill()
      });
    } else {
      this.notification.showError(
        'This bill is cancell so you couldnot get duplicate bill'
      );
    }
  }


  printDuplicateBill(){
    if(this.printerType=='dotMetrix'){
      this.printReceiptsDotmetrix()
    }

  }

  // print data
  printReceipts(data: any[]) {
    // Group items by Prathista and Vazhipad
    const groupedByPrathistaVazhipad = data.reduce((acc: any, item: any) => {
      const key = `${item.Prathista}-${item.Vazhipad}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

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
                        this.getStarbyId(item.Star) 
                       }<br/><span>${this.getStarbyId(item.Star2)}</span></td>

              <td>${this.formatDate(item.EvazDate) || 'N/A'}</td>
              <td>${item.Qty || '0'}</td>
              <td style="text-align: right;">${item.Rate.toFixed(2) || '0'}</td>
              <td style="text-align: right;">${
                item.Amount.toFixed(2) || '0'
              }</td>
          </tr>
      `
        )
        .join('');

      const receiptContent = `
          <div class="receipt-page">
              <h1>${this.templeName}</h1>
            <p>${this.templeAddress}</p>
            <h2 class="receipt-heading">വഴിപാട് രസീത്</h2>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: red;">പ്രതിഷ്ഠ: ${prathista}</strong>
            <strong>തീയതി: ${
              this.formatDate(items[0].BillDate) || 'N/A'
            }</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: green;">വഴിപാട്: ${vazhipad}</strong>
            <strong>നമ്പർ: ${items[0].BillNo || 'N/A'}</strong>
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
                          <td class="total-amount" style="text-align: right;"><strong>${totalAmount.toFixed(
                            2
                          )}</strong></td>
                      </tr>
                  </tbody>
              </table>
  <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <!-- Left side content (Counter ID and Duplicate stacked vertically) -->
            <div style="display: flex; flex-direction: column;">
                <strong style="margin-right: 15px;">Counter ID: ${
                  this.counterId
                }</strong>
                <strong>Duplicate</strong>
            </div>
            <!-- Right side content (Login ID and Transaction Mode stacked vertically) -->
            <div style="display: flex; flex-direction: column;">
                <strong style="margin-right: 15px;">Login ID: ${
                  this.loginId
                }</strong>
                <strong>Transaction Mode: ${this.displayTrnsmode}</strong>
            </div>
        </div>

          </div>
          ${
            i < prathistaVazhipadKeys.length - 1
              ? '<div class="page-break"></div>'
              : ''
          }
      `;

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
        printWindow.close();
      };
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
  formatDate(date: string | Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0'); // Add leading zero if day is single digit
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if month is single digit
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }


  // convertToDateFormat(dateString: string): any {
  //   const date = new Date(dateString); // Convert the string to a Date object
  //   return this.datePipe.transform(date, 'yyyy-MM-dd'); // Format to 'yyyy-MM-dd'
  // }

  editRow(row: any) {
    console.log(row);
    row.isEditing = true;
  }
  saveRow(row: any) {
    row.isEditing = false;
    console.log('Row saved:', row);
    const payLoad = {
      BillId: row.BillId,
      Name: row.Name,
      Star: row.Star,
      Name2: row.Name2,
      Star2: row.Star2,
    };
    // Example: Update the backend API with new values
    this.masterService.editBilllingDetils(payLoad).subscribe({
      next: (response) => {
        console.log('Row updated successfully:', response);
      },
      error: (error) => {
        console.error('Error updatinag row:', error);
      },
    });
  }

  // getStarData() {
  //   const payLoad = { Type: 'ListStar', Code: '' };
  //   this.masterService.getStarData(payLoad).subscribe((res) => {
  //     this.nakshatham = res;
  // console.log(this.nakshatham,"sdsfsddss")
  //     this.nakshatham = res.map((item) => ({
  //       SM_Id: item.id,
  //       SM_Name: item.SM_NameEng,
  //       SM_Code: item.SM_Code,
  //       SM_RName: item.SM_Name,
  //     }));
  //     console.log(this.nakshatham,"stttttttttttttt")
  //   });
  // }

  getStarbyId(id: string) {
    console.log(id, 'star id');
    if (this.lang == 'en') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_NameEng : '';
    } else if (this.lang == 'ml') {
      const star = this.nakshatham.find((item) => item.id == id);
      return star ? star.SM_Name : '';
    }

    // console.log(star,"sssssssssssssssss")
  }
 

  // Helper function to add wrapped text
  addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number) {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line:any, index:any) => {
      doc.text(line, x, y + (index * 6)); // 6 is the line height
    });
    return y + (lines.length * 6); // Return the new Y offset after wrapping
  }


  openWhatsAppWeb() {
    const whatsappUrl = 'https://web.whatsapp.com/'; // URL for WhatsApp Web
    window.open(whatsappUrl, '_blank'); // Open in a new tab
  }


  generatePDF(){
    const doc = new jsPDF();
    const columns = ['Vazhipad', 'Prathishta', 'Name', 'Star', 'Qty', 'Rate', 'Amount'];
    const rows = this.data.map((item:any) => [
      item.Vazhipad,
      item.Prathista,
      item.Name,
      item.Star,
      item.Qty,
      item.Rate,
      item.Amount,
    ]);

    // Adding title
    doc.text('Vazhipad Details', 14, 10);

    // Adding table
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
    });

    // Save the PDF
    doc.save('Vazhipad-Details.pdf');
  }

  // const generateDateRange = (startDate: string, endDate: string): string[] => {
  //   const dates = [];
  //   let current = new Date(startDate);
  //   const end = new Date(endDate);
  
  //   while (current <= end) {
  //     dates.push(current.toISOString().split('T')[0]);
  //     current.setDate(current.getDate() + 1);
  //   }
  
  //   return dates;
  // };

  printReceiptsDotmetrix() {
    // const { BillNo, Billdate, vazhipadinfo } = data;
  
    this.differentDateArray = [];
    
    
    // Iterate through the vazhipadinfo array and split based on the condition
    this.duplicatebilldata.forEach((item:any) => {
      
            this.differentDateArray.push(item); // Add to differentDateArray if FromDate != ToDate
      
    });
    
    // Output the arrays
    // console.log("Same Date Array:", this.sameDateArray);
    console.log("Different Date Array:", this.differentDateArray);
  
  
  if (this.differentDateArray.length > 0) {
    // Group data by Prathista, Vazhipad, and From Date
    const groupedData = this.differentDateArray.reduce((acc: any, item: any) => {
      const key = `${item.Prathista}/${item.Vazhipad}/${item.Fdate}/${item.Tdate}`;
      if (!acc[key]) {
        acc[key] = { items: [], totalQty: 0, uniqueNames: new Set(), nalBy: '', mday: '', thithi: '',mmonth:'' };
      }
      acc[key].items.push(item);
      acc[key].totalQty += parseInt(item.Qty, 10);
      acc[key].uniqueNames.add(item.Name);
  
  
    // Check if NalBy, Mday, or Thithi has data and store it
    if (item.NalBy) acc[key].nalBy = item.NalBy;
    if (item.MDay) acc[key].mday = item.MDay;
    if (item.SearchBy) acc[key].thithi = item.SearchBy;
    if (item.MMonth) acc[key].mmonth = item.MMonth;
  
      return acc;
    }, {});
  
    const maxRowsPerPage = 4; // Maximum rows per page
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
            <!-- Prathista -->
            <div style="position: absolute; left: 2.2cm; top: 3.4cm; max-width: 8cm;  white-space: pre-wrap; word-wrap: break-word; line-height: 1em;">${prathista}</div>
            <!-- Vazhipad -->
            <div style="position: absolute; left: 2.1cm; top: 3.9cm; max-width: 5cm; white-space: pre-wrap;">${vazhipad}</div>
            <!-- From Date -->
            <div style="position: absolute; left: 10.5cm; top: 3.4cm;">${this.billDate}</div>
            <!-- Total Quantity -->
            <div style="position: absolute; left: 10.5cm; top: 3.9cm;"> ${this.lastBillNo}</div>
             <!-- Vazhipad Date -->
           <div style="position: absolute; left: 5cm; top: 9.15cm;">
    ${fromDate != toDate ? `${this.convertDateFormat(fromDate)} to ${this.convertDateFormat(toDate)}` : `${this.convertDateFormat(fromDate)}`}
  </div>
  ${group.nalBy ? `<div style="position: absolute; left: 10cm; top: 9cm;">- ${group.nalBy},</div>` : ''}
  ${group.mday ? `<div style="position: absolute; left: 10cm; top: 9.15cm;">- ${group.mday},</div>` : ''}
  ${group.mmonth ? `<div style="position: absolute; left: 10cm; top:9.3cm;">- ${group.mmonth}</div>` : ''}
   <div style="position: absolute; left: 3.5cm; top: 8.4cm;">User id:${this.name}  ${this.displayTrnsmode=='CR'?"Not Paid":""}</div>
<div style="position: absolute; left: 10.5cm; top: 9cm; ; font-size: 10pt;">
          Duplicate Bill
        </div>
            `
  
        // Render rows in the current page
        page.forEach((item: any, rowIndex: number) => {
          let rowTop = 5 + rowIndex * 0.7; // Adjust row spacing
          const amount = item.Qty * item.Rate;
          grandTotalAmount += amount; // Add the amount to the grand total
          receiptContent += `
            <div style="position: absolute; left: 0.5cm; top: ${rowTop}cm; max-width: 5.5cm; white-space: pre-wrap; word-wrap: break-word; line-height: 1.2em;">${item.Name}${item.Name2 ? `<div style="margin-top: 0.1mm;">${item.Name2}</div>` : ''}</div>
            <div style="position: absolute; left: 6.9cm; top: ${rowTop}cm;">${this.getStarbyId(item.Star)}${item.Star2 ? `<div style="margin-top: 0.1mm;">${this.getStarbyId(item.Star2)}</div>` : ''}</div>
            <div style="position: absolute; left: 9.2cm; top: ${rowTop}cm;">${item.Qty}</div>
            <div style="position: absolute; left: 10.3cm; top: ${rowTop}cm;">${item.Rate}</div>
            <div style="position: absolute; left: 11.5cm; top: ${rowTop}cm;">${amount.toFixed(2)}</div>
          `;
        });
        // receiptContent += `</div>`; // Close receipt page
        // allReceiptsContent += receiptContent;
  
        // Add grand total at the end of the page
      // const grandTotalTop = 5 + page.length * 0.7 + 1; // Position it below the last row
      receiptContent += `
        <div style="position: absolute; left: 10.5cm; top: 8.4cm; font-weight: bold; font-size: 15pt;">
           ${grandTotalAmount.toFixed(2)}
        </div>
         
      </div>`; // Close receipt page
      allReceiptsContent += receiptContent;
    });
  });
  
  
  
    //   });
    // });
  
   
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
      // this.resetForm()
    }
  }
  }
  


  convertDateFormat(dateString: string): string {
    const date = new Date(dateString); // Convert the string to a Date object
    const day = String(date.getDate()).padStart(2, '0'); // Get the day and pad with 0
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month and pad with 0
    const year = date.getFullYear(); // Get the year
    return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
  }



  private showValidationErrors() {
    Object.keys(this.updateTransMode.controls).forEach((key) => {
      const controlErrors = this.updateTransMode.get(key)?.errors;
      if (controlErrors) {
        if (controlErrors['required']) {
          this.notification.showError(`${key} is required`, 'Billing');
        }
        if (controlErrors['pattern']) {
          if (key === 'MobileNo') {
            this.notification.showError(
              'Invalid phone number. Must be 10 digits atleast.'
            );
          }
         
        }
     
        if (controlErrors['minLength']) {
          if (key === 'MobileNo') {
            this.notification.showError(
              'Invalid phone number. Must be 10 digits atleast.'
            );
          }
        }
      }
    });
  }


  private markAllFieldsAsTouched() {
    this.updateTransMode.markAllAsTouched();
  }

  onEditTransmode(){
if(this.updateTransMode.invalid){
  this.showValidationErrors();
  this.markAllFieldsAsTouched();
  return;
}


   

      const formValue=this.updateTransMode.value;

      const payLoad={
        Type:"Booking",
        BillNo:this.lastBillNo,
        InstaNo:formValue.InstaNo,
        InstaDate:formValue.InstaDate,
        InstaBank:formValue.InstaBank,
        TransMode:formValue.Trnsmode,
        PaidStatus:formValue.PaidStatus,
        MobileNo:formValue.MobileNo,
      }
      console.log(payLoad,"payLoad")
      this.masterService.updateBookingTransmode(payLoad).subscribe((data)=>{
        console.log(data, "subscription data");
        this.notification.showSuccess(" Payment mode Updated successfully")
      })

  }



  private subscribeToTrnsmodeChanges() {
    
    this.updateTransMode
      .get('Trnsmode')
      ?.valueChanges.subscribe((value) => {
        if (value == 'CH') {
          this.setChequeValidators();
          this.clearCreditValidators();
        } else if (value == 'CR' ) {
          this.updateTransMode.patchValue({ PaidStatus: 'N' });
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



  private setChequeValidators() {
    this.updateTransMode
      .get('InstaNo')
      ?.setValidators([Validators.required,Validators.minLength(6)]);
    this.updateTransMode
      .get('InstaBank')
      ?.setValidators([Validators.required]);
    this.updateTransMode
      .get('InstaDate')
      ?.setValidators([Validators.required]);
    this.updateTransMode.get('InstaNo')?.updateValueAndValidity();
    this.updateTransMode
      .get('InstaBank')
      ?.updateValueAndValidity();
    this.updateTransMode
      .get('InstaDate')
      ?.updateValueAndValidity();
  }


  private clearChequeValidators() {
    this.updateTransMode.get('InstaNo')?.clearValidators();
    this.updateTransMode.get('InstaBank')?.clearValidators();
    this.updateTransMode.get('InstaDate')?.clearValidators();
    this.updateTransMode.get('InstaNo')?.updateValueAndValidity();
    this.updateTransMode
      .get('InstaBank')
      ?.updateValueAndValidity();
    this.updateTransMode
      .get('InstaDate')
      ?.updateValueAndValidity();
  }


  private setCreditValidators() {
    this.updateTransMode
      .get('MobileNo')
      ?.setValidators([Validators.required,Validators.minLength(10),Validators.pattern('^[0-9]{10}$')],);
    this.updateTransMode.get('MobileNo')?.updateValueAndValidity();
  }


  private clearCreditValidators() {
    this.updateTransMode.get('MobileNo')?.clearValidators();
    this.updateTransMode.get('MobileNo')?.updateValueAndValidity();
  }

  private clearUpiValidators() {
    this.updateTransMode.get('InstaNo')?.clearValidators();
    this.updateTransMode.get('InstaNo')?.updateValueAndValidity();
  }

  convertToDateFormatyyymmdd(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are 0-based
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }





  printPage(): void {
    const printContent = document.getElementById('print-section');
    if (printContent) {
      const WindowPrt = window.open('', '', 'width=900,height=650');
      WindowPrt?.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              @page { 
                size: A4 portrait; 
                margin: 20mm; /* Ensures left & right margins on all pages */
              }
              body { 
                font-family: 'Arial', sans-serif; 
                color: #333; 
                line-height: 1.5;
                margin: 0;
                padding: 0;
              }
  
              /* Hide Header on First Page */
              .header:first-of-type {
                display: none;
              }
  
              /* Prathista & Vazhipad Title */
              .prathista-title {
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                padding: 10px;
                margin-bottom: 5px;
                border-bottom: 2px solid #444;
              }
              
              /* Table Styling */
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              th, td {
                border: 1px solid #ccc;
                padding: 10px;
                text-align: left;
              }
              th {
                background-color: #f4f4f4;
                font-weight: bold;
              }
              tbody tr:nth-child(even) {
                background-color: #f9f9f9;
              }
  
              /* Page Break for Each Prathista & Vazhipad */
              .group-container {
                page-break-before: always; /* Ensures new page per section */
                padding-left: 20mm;
                padding-right: 20mm;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      WindowPrt?.document.close();
      WindowPrt?.focus();
      WindowPrt?.print();
    }
  }
  


  groupDataByPrathistaAndVazhipad(): void {
    this.gropedData = this.data.reduce((acc: GroupedData, item: any) => {
      const prathistaKey = item.Prathista;
      const vazhipadKey = item.Vazhipad;
  
      if (!acc[prathistaKey]) {
        acc[prathistaKey] = {};
      }
  
      if (!acc[prathistaKey][vazhipadKey]) {
        acc[prathistaKey][vazhipadKey] = [];
      }
  
      acc[prathistaKey][vazhipadKey].push({
        Name: item.Name,
        Star: item.Star,
        Rate: item.Rate,
        Amount: item.Amount,
      });
  
      return acc;
    }, {} as GroupedData);  // 👈 Type assertion ensures proper structure
  
    console.log(this.gropedData, "PDF making");
  }
  


  calculateTotalAmount(entries: any[]): number {
    return entries.reduce((total, entry) => total + entry.Amount, 0);
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }




  }



import { Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CancelBillRemarkComponent } from '../cancel-bill-remark/cancel-bill-remark.component';
import { NotificationService } from '../../../services/notification/notification.service';
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
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  cancellationReason: string = '';

  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  remarkDialogRef: MatDialogRef<any>;
  constructor(
    public dialogRef: MatDialogRef<SearchByBillNumberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private masterService: MasterService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {
    this.lastBillNo = data[0].BillNo;
    this.TrnStatus = data[0].TrnStatus;
    this.displayTrnsmode = data[0].TrnsMode;
    this.duplicatebilldata = data;

    this.dataSource = new MatTableDataSource(this.duplicatebilldata);
    this.role = localStorage.getItem('Role');
    this.loginId = localStorage.getItem('LoginId');
    this.counterId = localStorage.getItem('counterId');
  }

  ngOnInit() {
    this.loadStarData();
  }

  getNakshthram(id: string): string {
    return this.starData[id] || 'Unknown'; // Return 'Unknown' if ID not found
  }

  loadStarData(): void {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterService.getStarData(payLoad).subscribe({
      next: (data: any[]) => {
        console.log(data); // Specify that data is an array of Star
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
      Type:"Booking",
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
      this.printReceipts(this.duplicatebilldata);
    } else {
      this.notification.showError(
        'This bill is cancell so you couldnot get duplicate bill'
      );
    }
  }

  // print data
  printReceipts(data: any[]) {
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
                        starNameMapping[
                          item.Star as keyof typeof starNameMapping
                        ] || ' '
                      }</td>

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
              <h1>Koduvayur Sree Subrahmanya Swami Kshethram</h1>
              <div style="display: flex; justify-content: space-between;">
                  <strong style="color: green;">Vazhipad: ${vazhipad}</strong>
                  <strong>Bill Date: ${
                    this.formatDate(items[0].BillDate) || 'N/A'
                  }</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                  <strong style="color: red;">Prathista: ${prathista}</strong>
                  <strong>Bill No: ${items[0].BillNo || 'N/A'}</strong>
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
                  this.loginId
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

  formatDate(date: string | Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0'); // Add leading zero if day is single digit
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if month is single digit
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

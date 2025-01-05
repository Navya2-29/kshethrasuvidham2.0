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
import { CommonModule } from '@angular/common';
import { ReceiptPrintService } from '../../../shared/service/receipt-print.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CancelBillRemarkComponent } from '../cancel-bill-remark/cancel-bill-remark.component';
import { NotificationService } from '../../../services/notification/notification.service';
import { MatSelectModule } from '@angular/material/select';

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
    MatSelectModule, // Add this
    MatInputModule, // Add this
    MatFormFieldModule,
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
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  cancellationReason: string = '';
  templeAddress: string | null;
  lang: string | null;
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
    this.templeName = localStorage.getItem('TempleName');
    this.logo = localStorage.getItem('Logo');
    this.templeAddress = localStorage.getItem('Address');
    this.lang = localStorage.getItem('Language');
  }

  ngOnInit() {
    this.loadStarData();
    // this.getStarData();
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
        this.printReceipts(this.duplicatebilldata);
      });
    } else {
      this.notification.showError(
        'This bill is cancell so you couldnot get duplicate bill'
      );
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
    const columns = ['Vazhipad', 'Prathista', 'Name', 'Star', 'Qty', 'Rate', 'Amount'];
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


  
  }



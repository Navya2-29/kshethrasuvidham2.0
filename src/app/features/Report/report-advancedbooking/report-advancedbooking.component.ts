import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportService } from '../service/report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { jsPDF } from 'jspdf'; 
import {ReportData} from '../../../models/poornam-report'
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-report-advancedbooking',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule],
  templateUrl: './report-advancedbooking.component.html',
  styleUrl: './report-advancedbooking.component.css'
})
export class ReportAdvancedbookingComponent {
  displayedColumns: string[] = ['BillNo','BillDate','Vazhipad', 'Name', 'Star', 'Qty', 'Rate', 'Amount',  'VazhiDate', ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 7,10, 20, 50];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  constructor(private route: ActivatedRoute, private service: ReportService,private router: Router) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      const fromDate = params['fromDate'];
      const toDate = params['toDate'];
      this.fetchReportData(type, fromDate, toDate);
    });
  }



 // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    const payLoad = {
      Type: type,
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
        this.data = data.sort((a:any, b:any) => {
          const [numA, denomA] = a.BillNo.split('/').map(Number);
          const [numB, denomB] = b.BillNo.split('/').map(Number);
          
          // Compare the two parts: first compare the numerator, then the denominator
          return numA - numB || denomA - denomB;
      });
        this.dataSource.data = this.data
        this.length = data.length; 
        this.dataSource.paginator = this.paginator;
        
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
  
  goBack(): void {
    console.log('Going back...'); // Log to verify method execution
    this.router.navigate(['/getReport']);
  }


  generatePDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 10;
    let currentY = 20;
    let grandTotal = 0; // Variable to keep track of the total amount
  
    // Header section
    doc.setFontSize(18);
    doc.setFont('bold');
    doc.text('MAMMIYOOR DEVASWOM', pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;
  
    doc.setFontSize(12);
    doc.setFont('normal');
    doc.text('Under Malabar Devaswom Board, Guruvayur, Thrissur-680 101.', pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;
  
    doc.setFontSize(16);
    doc.setFont('bold');
    doc.text('Daily Statement Advance Booking', pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;
  
    const formattedDate = new Date().toLocaleDateString('en-GB');
    doc.setFontSize(10);
    doc.text(`Date: ${formattedDate}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
  
    // Table header
    doc.setFontSize(10);
    doc.setFillColor(200, 200, 200);
    doc.rect(marginLeft, currentY, pageWidth - 20, 10, 'FD');
    doc.text('Bill No.', marginLeft + 5, currentY + 7);
    doc.text('Name', marginLeft + 40, currentY + 7);
    doc.text('Star', marginLeft + 80, currentY + 7);
    doc.text('Nos.', marginLeft + 110, currentY + 7);
    doc.text('Date', marginLeft + 140, currentY + 7);
    doc.text('Amount', marginLeft + 170, currentY + 7);
    currentY += 15;
  
    // Loop through each item in data and display it
    this.data.forEach((item) => {
      doc.setFontSize(10);
      doc.setFont('normal');
  
      const billNoText = item.BillNo || '';
      const nameText = item.Name || '';
      const starText = item.Star || '';
      const qtyText = item.Qty ? item.Qty.toString() : '';
      const dateText = item.VazhiDate || '';
      const amountText = item.Amount ? item.Amount.toString() : '';
  
      // Add the amount to the grand total
      const amountValue = Number(item.Amount) || 0;
      grandTotal += amountValue;
  
      // Render the row
      doc.text(billNoText, marginLeft + 5, currentY);
      doc.text(nameText, marginLeft + 40, currentY);
      doc.text(starText, marginLeft + 80, currentY);
      doc.text(qtyText, marginLeft + 110, currentY);
      doc.text(dateText, marginLeft + 140, currentY);
      doc.text(amountText, marginLeft + 170, currentY);
  
      currentY += 10;
  
      // Check for page overflow and add a new page if necessary
      if (currentY > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
    });
  
    // Display Grand Total on the last page
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
    }
    
    currentY += 10;
    doc.setFontSize(12);
    doc.setFont('bold');
    doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, pageWidth - 60, currentY);
  
    // Save the PDF
    doc.save('AdvanceBooking.pdf');
  }
  
  
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { SpinnerComponent } from '../../../shared/component/spinner/spinner.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common';
import { MasterService } from '../../../services/master/master.service';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


interface Transaction {
  Vazhipad: string;
  Qty: string;
  Amount: string;
  Rate:string
}
@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    SpinnerComponent,
    ReactiveFormsModule,
    MatTableModule,
  ],
  templateUrl: './report-dashboard.component.html',
  styleUrl: './report-dashboard.component.css',
  providers: [DatePipe],
})



export class ReportDashboardComponent {
  @ViewChild('pdfTable') pdfTable!: ElementRef;
  selectedVazhipadOption: string;
  searchForm: FormGroup;
  dataList: any[] = [];
  filteredDataList: any[] = [];
  tableHeading: string = '';
  csDataList: any[] = [];
  upiDataList: any[] = [];
  debitDataList: any[] = [];
 creditDataList: any[] = [];
  chequeDataList: any[] = [];
  cashTransactionData: Transaction[] = [];
  upiTransactionData: Transaction[] = [];
  totalAmount: number = 0;
  displayedColumns: string[] = [
    'SI',
    'Vazhipad',
    'Name',
    'Star',
    'Qty',
    'Rate',
    'Amount',
    'BillDate',
    'VazhiDate',
    'BillNo',
    'Total'
  ];
  isDataLoading = false;
  currentDate: Date = new Date();
  isSearchPerformed: boolean = false;
  isloading: boolean = false;
  userName:string |null;
  constructor(
    private fb: FormBuilder,
    private service: MasterService,
    private router: Router
  ) {
    // Initialize the form group
    this.searchForm = this.fb.group({
      vazhipadOption: [''], // Add this form control for the radio button
      fromDate: [''],
      toDate: [''],
    });


    this.userName = localStorage.getItem('name');
  }

  ngOnInit() {
    this.searchForm.get('vazhipadOption')?.valueChanges.subscribe(value => {
        this.onVazhipadChange(value);
    });
}

onVazhipadChange(vazhipad: string) {
  this.tableHeading = this.getHeadingForVazhipad(vazhipad);
  console.log(vazhipad)
  this.selectedVazhipadOption=vazhipad;
  this.updateDisplayedColumns();
}


updateDisplayedColumns() {
  if (this.selectedVazhipadOption === 'DailyStmtDetaild') {
    this.displayedColumns = [
      'SI',
      'Vazhipad',
      'Qty',
      'Rate',
      'Amount',
     
    ];
  } else {
    this.displayedColumns = [
      'SI',
      'Vazhipad',
      'Name',
      'Star',
      'Qty',
      'Rate',
      'BillDate',
      'VazhiDate',
      'BillNo',
    ];
  }
}






getHeadingForVazhipad(vazhipad: string): string {
  switch (vazhipad) {
      case 'DailyStmt':
          return 'Daily Statement Report';
      case 'AdvanceBook':
          return 'Advance Booking Report';
      case 'Poornam':
          return 'Poornam Report';
      case 'DailyStmtDetaild':
          return 'Daily Statement (Detailed)';
      default:
          return 'Vazhipad Report'; // Default heading
  }
}

  onSearch() {
    this.isloading = true;
    const vazhipad = this.searchForm.get('vazhipadOption')?.value;
    const fromDate = this.searchForm.get('fromDate')?.value;
    const toDate = this.searchForm.get('toDate')?.value;

    // Check if all required fields are filled
    if (vazhipad && fromDate && toDate) {
      // Call the API with vazhipad, fromDate, and toDate parameters
      this.fetchVazhipadList(vazhipad, fromDate, toDate);
      this.isloading = true;
    } else {
      alert('Please select a Vazhipad option and both From Date and To Date.');
    }
  }




  fetchVazhipadList(vazhipad: string, fromDate: string, toDate: string) {
    this.isloading = true;
    const datePipe = new DatePipe('en-US');

    // Format the dates
    const formattedFromDate = datePipe.transform(fromDate, 'dd/MM/yyyy');
    const formattedToDate = datePipe.transform(toDate, 'dd/MM/yyyy');
    const payLoad = {
      Type: vazhipad,
      FromDate: formattedFromDate,
      ToDate: formattedToDate,
    };
    console.log(payLoad);
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log(data);
        this.dataList = data;

        this.csDataList = this.dataList.filter(item => item.TrnsMode === 'cs');
        this.upiDataList = this.dataList.filter(item => item.TrnsMode === 'upi');
        this.debitDataList = this.dataList.filter(item => item.TrnsMode === 'debit');
        this.creditDataList = this.dataList.filter(item => item.TrnsMode === 'credit' );
        this.chequeDataList = this.dataList.filter(item => item.TrnsMode === 'cheque' );

        this.cashTransactionData = this.groupVazhipadData(this.csDataList);
        this.upiTransactionData=this.groupVazhipadData(this.upiDataList);

        this.calculateTotalAmount();
        // if (this.searchForm.get('vazhipadOption')?.value === 'dailystmtdetaild') {
        //   const totalAmount = this.calculateTotalAmount();
        //   this.dataList.push({ Total: true, Amount: totalAmount });
        // }

        // this.filteredDataList = this.filterData(vazhipad, fromDate, toDate); // Filter the data based on conditions
        // this.countOccurrences();
        console.log(this.filteredDataList)
        this.isSearchPerformed = true;
        this.isloading = false;
      },
      error: (err) => {
        console.log(err);
        this.isSearchPerformed = false;
      },
    });
  }


  calculateTotalAmount() {
    this.totalAmount = this.cashTransactionData.reduce((sum, item) => {
      return sum + parseFloat(item.Amount);
    }, 0);
    console.log(this.totalAmount);
  }

  groupVazhipadData(transactionData: Transaction[]): Transaction[] {
    return transactionData.reduce<Transaction[]>((acc, current) => {
      // Convert qty and rate from string to number
      const qtyAsNumber = parseFloat(current.Qty); // Convert qty to number
      const rateAsNumber = parseFloat(current.Rate); // Convert rate to number

      // Find if the vazhipad already exists in the accumulator
      const existingEntry = acc.find(item => item.Vazhipad === current.Vazhipad);

      if (existingEntry) {
        // Sum up the quantities as numbers
        existingEntry.Qty = (parseFloat(existingEntry.Qty) + qtyAsNumber).toString(); // Store as string
      } else {
        // Create a new entry, keeping qty and rate as strings
        acc.push({
          Vazhipad: current.Vazhipad,
          Qty: qtyAsNumber.toString(),  // Store as string
          Amount: '0', // Initialize amount as '0' (to be calculated later)
          Rate: current.Rate // Use the same rate directly
        });
      }

      // Update the amount based on quantity and rate
      const totalQty = parseFloat(existingEntry ? existingEntry.Qty : qtyAsNumber.toString());
      const totalAmount = (totalQty * rateAsNumber).toString();
      
      // Update amount for existing entry
      if (existingEntry) {
        existingEntry.Amount = totalAmount;
      } else {
        acc[acc.length - 1].Amount = totalAmount; // Update amount for the last pushed entry
      }

      return acc; // Return the accumulator
    }, []);
  }
  



  filterData(vazhipad: string, fromDate: string, toDate: string): any[] {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return this.dataList.filter((item) => {
      // Parse BillDate from dd.mm.yyyy format
      const billDateParts = item.BillDate.split('.'); // Split the date string
      const billDate = new Date(
        +billDateParts[2],
        +billDateParts[1] - 1,
        +billDateParts[0]
      ); // Create a Date object

      const isWithinDateRange = billDate >= from && billDate <= to;

      // Check conditions based on vazhipad value
      if (vazhipad === 'DailyStmt' || vazhipad === 'AdvanceBook') {
        return isWithinDateRange; // Return items within the date range
      } else {
        return item.Vazhipad === vazhipad; // Return items matching the selected vazhipad
      }
    });
  }

  onBackButtonClick() {
    this.router.navigate(['/dashboard']);
  }

  generatePDF() {
    const vazhipad = this.searchForm.get('vazhipadOption')?.value; // Get the selected report type
    const fromDate = this.searchForm.get('fromDate')?.value; // Get from date
    const toDate = this.searchForm.get('toDate')?.value; // Get to date

    // Check if the report type and dates are selected
    if (!vazhipad || !fromDate || !toDate) {
      alert(
        'Please select a report type and both From Date and To Date before generating the PDF.'
      );
      return; // Exit the function if validation fails
    }

    if (this.dataList.length === 0) {
      alert('No data available to generate PDF. Please perform a search.');
      return; // Exit the method if no data
    }
    const pdf = new jsPDF('p', 'pt', 'a4'); // Create a new PDF document

    // Adding title
    pdf.setFontSize(20);
    pdf.text(this.tableHeading, 40, 50);

    // Adding date
    pdf.setFontSize(12);
    pdf.text(`Date: ${this.currentDate.toLocaleDateString('en-GB')}`, 40, 70);

    // Adding table
    autoTable(pdf, {
      head: [
        [
          'SI',
          'Vazhipad',
          'Name',
          'Star',
          'Qty',
          'Rate',
          'BillDate',
          'VazhiDate',
          'BillNo',
        ],
      ],
      body: this.dataList.map((item: any, index: number) => [
        index + 1, // Serial number
        item.Vazhipad, // Code from your data
        item.Name, // Vazhipad name from your data
        item.Star, // Amount from your data
        item.Qty,
        item.Rate,
        item.BillDate,
        item.VazhiDate,
        item.BillNo, // Time from your data
      ]),
      startY: 100, // Y position for the table
      margin: { top: 20, bottom: 20 },
      theme: 'grid', // Using the grid theme for a better appearance
    });

    // Save the PDF
    pdf.save('poornam_report.pdf');
  }

  convertToCSV(): void {
    // Check if dataList has data before converting to CSV
    if (this.dataList.length === 0) {
      alert('No data available to convert to CSV. Please perform a search.');
      return; // Exit the method if no data
    }

    // Define the CSV headers
    const csvHeaders = [
      'SI',
      'Vazhipad',
      'Name',
      'Star',
      'Qty',
      'Rate',
      'BillDate',
      'VazhiDate',
      'BillNo',
    ];
    const csvRows = [];

    // Add the headers to the CSV rows
    csvRows.push(csvHeaders.join(','));

    // Add the data to the CSV rows
    this.dataList.forEach((item: any, index: number) => {
      const csvRow = [
        index + 1, // Serial number
        item.Vazhipad, // Code from your data
        item.Name, // Vazhipad name from your data
        item.Star, // Amount from your data
        item.Qty,
        item.Rate,
        item.BillDate,
        item.VazhiDate,
        item.BillNo,
      ];
      csvRows.push(csvRow.join(',')); // Join values with a comma
    });

    // Create a CSV string
    const csvString = csvRows.join('\n');

    // Create a blob and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vazhipad_report.csv'); // Filename for download
    document.body.appendChild(link);
    link.click(); // Trigger download
    document.body.removeChild(link); // Clean up
  }


  onPrint() {
    const printContent = document.getElementById('printableArea')?.innerHTML;
    const windowToPrint = window.open('', '', 'width=800,height=600');
    windowToPrint?.document.open();
    windowToPrint?.document.write(`
        <html>
            <head>
                <title>Print Report</title>
                <style>
                    /* Add any styles you need for printing */
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                </style>
            </head>
            <body onload="window.print();window.close()">
                ${printContent}
            </body>
        </html>
    `);
    windowToPrint?.document.close();
}





}

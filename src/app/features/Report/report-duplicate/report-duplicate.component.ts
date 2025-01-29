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
import { Location } from '@angular/common';
import autoTable from 'jspdf-autotable';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-report-duplicate',
  standalone: true,
  imports: [CommonModule,TranslateModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './report-duplicate.component.html',
  styleUrl: './report-duplicate.component.css'
})
export class ReportDuplicateComponent {

  displayedColumns: string[] = ['BillNo','BillDate','Vazhipad', 'Name', 'Mobile','Qty','Rate','Amount', 'TransMode'  ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  filteredData:ReportData[]=[];
  fromDate:string;
  toDate:string;
  lang:string|null;
  templeName:string|null;
  templeAddress:string|null;
  constructor(private route: ActivatedRoute, private ts: TranslateService, private service: ReportService,private router: Router, private http:HttpClient) {
    this.lang=localStorage.getItem('Language');
    this.templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
    this. templeAddress = localStorage.getItem('Address') || 'Default Temple Address'; 
    const userLang = navigator.language || 'en';
    const languageCode = userLang.split('-')[0];
    this.ts.setDefaultLang(languageCode);
    this.ts.use(this.lang || 'en');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];
      this. fromDate = params['fromDate'];
      this. toDate = params['toDate'];
      this.fetchReportData(type, this.fromDate, this.toDate);
    });
  }

 // Call your API service to get the report data
  fetchReportData(type: string, fromDate: string, toDate: string): void {
    const payLoad = {
      Type: 'DuplicateCount',
      FromDate: fromDate,
      ToDate: toDate,
    };
    this.service.getReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
         this.filteredData = this.data.filter(item => item.TrnsMode === 'CR');   
        //  this.filteredData = this.filteredData.sort((a:any, b:any) => {
        //   const [numA, denomA] = a.BillNo.split('/').map(Number);
        //   const [numB, denomB] = b.BillNo.split('/').map(Number);
          
        //   // Compare the two parts: first compare the numerator, then the denominator
        //   return numA - numB || denomA - denomB;
      // });
      

        this.dataSource.data = this.data
        console.log( this.dataSource.data)
        this.length =this.data .length; 
        this.dataSource.paginator = this.paginator;
       
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


    if (window.history.length > 1) {
      window.history.back(); // Goes back to the previous page in history
    } else {
      window.close(); // Closes the tab if it's the only page open
    }


  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

//   generatePDF(): void {
//     // Filter data for entries with transmode 'ch'
//     const filteredData = this.data
  
//     const templeName = localStorage.getItem('TempleName') || 'Default Temple Name';
//     const templeAddress = localStorage.getItem('Address') || 'Default Temple Address';
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.width;
//     const pageHeight = doc.internal.pageSize.height;
//     const headerHeight = 35;
//     const footerHeight = 8;
//     const lineHeight = 8;
//     const tableHeaderFontSize = 11;
//     const contentFontSize = 8;
//     const currentDate = new Date().toLocaleDateString();
  
//     const maxColumnWidths = [20, 55, 40, 30, 15, 15, 15]; // Column widths for each column
//     const headers = ["Bill No.", "Vazhipad", "Name", "Mobile", "Ennam", "Rate", "Total"];
  
//     let y = headerHeight;
//     let grandTotalRate = 0;
//     let grandTotalAmount = 0;
  

//     this.http
//     .get('assets/fonts/malayalam/NotoSansMalayalam-Regular.ttf', {
//       responseType: 'arraybuffer',
//     })
//     .subscribe(
//       (fontData) => {
//         const doc = new jsPDF();

//         // Convert ArrayBuffer to Base64
//         const fontBase64 = btoa(
//           String.fromCharCode(...new Uint8Array(fontData))
//         );

//         // Add the font to jsPDF
//         doc.addFileToVFS(
//           'NotoSansMalayalam-Regular.ttf',
//           fontBase64
//         );
//         doc.addFont(
//           'NotoSansMalayalam-Regular.ttf',
//           'NotoSansMalayalam',
//           'normal'
//         );

//         // Set the custom font
//         doc.setFont('NotoSansMalayalam');


//     // Draw Header
//     const drawHeader = () => {
//       doc.setFontSize(12);
//       doc.setFont("NotoSansMalayalam", "bold");
//       doc.text(templeName, pageWidth / 2, 12, { align: "center" });
//       doc.setFont("NotoSansMalayalam", "normal");
//       doc.setFontSize(10);
//       doc.text(templeAddress, pageWidth / 2, 18, { align: "center" });
    
//       doc.setFontSize(10);
//       doc.setFont("NotoSansMalayalam", "bold");
//       doc.text("Credit Transaction Report", pageWidth / 2, 27, { align: "center" });
    
//       // Add current date below the report title but above the table header
//       doc.setFontSize(10);
//       doc.setFont("NotoSansMalayalam", "normal");
//       doc.text(`${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`, pageWidth / 2, 32, { align: "center" });
    
//       doc.setLineWidth(0.5);
//       doc.line(10, y, pageWidth - 10, y); // Line below header
//       y += 3; // Space below the line
//     };
  
//     // Draw Footer
//     const drawFooter = (pageNum: number) => {
//       doc.setFontSize(10);
//       doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - footerHeight / 2, { align: "center" });
//     };
  
//     // Add Table Header
//     const drawTableHeader = () => {
//       doc.setFontSize(tableHeaderFontSize);
//       doc.setFont("NotoSansMalayalam", "bold");
//       let x = 10;
//       headers.forEach((header, index) => {
//         doc.text(header, x, y + 5);
//         x += maxColumnWidths[index];
//       });
//       y += lineHeight;
//       doc.setLineWidth(0.3);
//       doc.setDrawColor(200, 200, 200); // Light gray color for grid lines
//       doc.line(10, y, pageWidth - 10, y); // Line below the table header
//       y += 2;
//     };
  
//     // Helper to Wrap Text
//     const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
//       const lines = doc.splitTextToSize(text, maxWidth);
//       return lines;
//     };
  
//     // Initialize PDF
//     drawHeader();
//     drawFooter(1);
//     drawTableHeader();
  
//     let pageNum = 1;
  
//     // Iterate over data and draw rows
//     this.data.forEach((row: any) => {
//       const tableRow = [
//         row.BillNo,
//         wrapText(doc, row.Vazhipad, maxColumnWidths[1]), // Wrap Vazhipad
//         wrapText(doc, row.Name, maxColumnWidths[2]),     // Wrap Name
//         row.MobileNo,
//         row.Qty,
//         row.Rate.toFixed(2),
//         row.Amount.toFixed(2),
//       ];
  
//       // Calculate the max height required for wrapped text in the row
//       const rowHeight = Math.max(...tableRow.map((cell, index) => {
//         return Array.isArray(cell) ? cell.length * contentFontSize : lineHeight;
//       }));
  
//       // Check if a new page is needed
//       if (y + rowHeight > pageHeight - footerHeight - 10) {
//         doc.addPage();
//         pageNum++;
//         y = headerHeight + 5;
//         drawHeader();
//         drawFooter(pageNum);
//         drawTableHeader();
//       }
  
//       let x = 10;
  
//       // Draw each cell with normal font
//       doc.setFont("NotoSansMalayalam", "normal");
//       doc.setFontSize(contentFontSize );
  
//       tableRow.forEach((cell, index) => {
//         if (Array.isArray(cell)) {
//           // Handle wrapped text
//           cell.forEach((line, lineIndex) => {
//             doc.text(line, x, y + 5 + (lineIndex * contentFontSize));
//           });
//         } else {
//           if (index === 5 || index === 6 || index === 4) {
//             // Align Rate and Total columns to the right
//             doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "right" });
//           } else {
//             // Left-align other columns
//             doc.text(String(cell), x, y + 5);
//           }
//         }
//         x += maxColumnWidths[index];
//       });
  
//       // Draw row grid lines
//       doc.setLineWidth(0.3); // Light line width for grid
//       doc.setDrawColor(200, 200, 200); // Light gray color
//       doc.line(10, y, pageWidth - 10, y); // Line at the bottom of the row
  
//       // Accumulate grand totals
//       grandTotalRate += row.Rate;
//       grandTotalAmount += row.Amount;
  
//       y += rowHeight; // Move y position for the next row
//     });
  
//     // Add Grand Total row
//     const grandTotalRow = [
//       "",
//       "Grand Total", 
//       "",
//       "", 
//       "", 
//       "", 
//       grandTotalAmount.toFixed(2)
//     ];
  
//     let x = 10;
//     doc.setFont("NotoSansMalayalam", "bold");
//     doc.setFontSize(contentFontSize +2);
//     grandTotalRow.forEach((cell, index) => {
//       if (index === 5 || index === 6) {
//         // Align Rate and Total columns to the right
//         doc.text(String(cell), x + maxColumnWidths[index] - 2, y + 5, { align: "right" });
//       } else {
//         // Left-align other columns
//         doc.text(String(cell), x, y + 5);
//       }
//       x += maxColumnWidths[index];
//     });
  
//     // Draw grid line after Grand Total
//     doc.setLineWidth(0.3);
//     doc.setDrawColor(200, 200, 200);
//     doc.line(10, y, pageWidth - 10, y);
  
//     y += lineHeight; // Move y position for the Grand Total row
  
//     // Save PDF
   
//     // doc.save('Credit_Transaction_Report.pdf');

//     const pdfBlob = doc.output('blob');
//     const pdfUrl = URL.createObjectURL(pdfBlob);
//     window.open(pdfUrl, '_blank');
//     // doc.save('vazhipad_report_with_header_footer.pdf');



//   },
//   (error:any) => {
//     console.error('Error loading font:', error);
//   }
// );


//   }

generatePDF() {
  const printContent = document.getElementById('print-section');
  if (!printContent) {
    console.error('No content found to print');
    return;
  }

  // Open a new window for printing
  const printWindow = window.open('', '', 'width=800,height=600');

  // Check if the print window was successfully opened
  if (!printWindow) {
    console.error('Unable to open print window. Please check pop-up blockers.');
    return;
  }

  // Inject content and print-specific CSS
  printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          /* Apply your print-specific styles here */
          @media print {
            body {
              font-size: 10px; /* Adjust font size for printing */
            }
            #print-section {
              font-size: 10px;
            }
            /* Other print-specific styling adjustments */
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Trigger the print dialog
  printWindow.print();

  // Close the print window after printing
  printWindow.close();
}

getTotalAmount(): number {
  return this.data.reduce((sum, item) => sum + item.Amount, 0);
}

  getTransactionType(transmode: string): string {
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
        return 'CREDIT';
      case 'DE':
        return 'DEBIT';

      default:
        return 'OTHERS';
    }
  }
}

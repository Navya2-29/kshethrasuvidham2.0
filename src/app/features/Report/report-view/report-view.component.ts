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
import { HttpClient } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import html2pdf from 'html2pdf.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,TranslateModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './report-view.component.html',
  styleUrl: './report-view.component.css',
})
export class ReportViewComponent implements OnInit {
  
  displayedColumns: string[] = ['BillNo','BillDate','Prathista','Vazhipad', 'Name', 'Star', 'Qty', 'Rate', 'Amount',  'VazhiDate', ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  fromDate:string;
  toDate:string;
  lang:string|null;
templeName:string|null;
templeAddress:string|null;
  constructor(private route: ActivatedRoute, private ts: TranslateService, private service: ReportService,private router: Router,private http: HttpClient ) {

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
      this.fetchReportData(type,this. fromDate, this.toDate);
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
      //   this.data = data.sort((a:any, b:any) => {
      //     const [numA, denomA] = a.BillNo.split('/').map(Number);
      //     const [numB, denomB] = b.BillNo.split('/').map(Number);
          
      //     // Compare the two parts: first compare the numerator, then the denominator
      //     return numA - numB || denomA - denomB;
      // });
        this.dataSource.data = this.data
        this.length = data.length; 
        this.dataSource.paginator = this.paginator;
        
        this.groupedData = this.groupByVazhipad(data);
        console.log(this.groupedData);
      },
      error: (error) => {
        console.error('Error fetching report data:', error);
      },
    });
  }


  groupByVazhipad(data: ReportData[]): { [key: string]: ReportData[] } {
    return data.reduce((acc, current) => {
        const key = `${current.Vazhipad}-${current.Prathista}`; 
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(current);
        return acc;
    }, {} as { [key: string]: ReportData[] });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  formatDateToDDMMYYYY(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  // generatePDF() {
  //   const doc = new jsPDF();
  //   const pageWidth = doc.internal.pageSize.width;
  //   const pageHeight = doc.internal.pageSize.height;
  
  //   this.http
  //     .get('assets/fonts/malayalam/NotoSansMalayalam-Regular.ttf', {
  //       responseType: 'arraybuffer',
  //     })
  //     .subscribe(
  //       (fontData) => {
  //         // Convert ArrayBuffer to Base64
  //         const fontBase64 = btoa(
  //           String.fromCharCode(...new Uint8Array(fontData))
  //         );
  
  //         // Add the font to jsPDF
  //         doc.addFileToVFS('NotoSansMalayalam-Regular.ttf', fontBase64);
  //         doc.addFont(
  //           'NotoSansMalayalam-Regular.ttf',
  //           'NotoSansMalayalam',
  //           'normal'
  //         );
  //         doc.addFont(
  //           'NotoSansMalayalam-Regular.ttf',
  //           'NotoSansMalayalam',
  //           'bold'
  //         );
  
  //         // Set the custom font
  //         doc.setFont('NotoSansMalayalam');
  
  //         const title = 'Vazhipad Report';
  //         const currentDate = new Date().toLocaleDateString('en-IN');
  //         const lineHeight = 8; // Row height for the table
  //         const smallSpacing = 4; // Space between groups
  //         const headerSpacing = 6; // Space between header and content
  //         const groupNameFontSize = 12; // Font size for group name
  //         const tableContentFontSize = 10; // Font size for table content
  //         const headerHeight = 20; // Height of header
  //         const footerHeight = 20; // Height of footer
  
  //         // Function to Draw Header
  //         const drawHeader = () => {
  //           doc.setFontSize(18);
  //           doc.setFont("NotoSansMalayalam", "bold");
  //           const titleWidth = doc.getTextWidth(title);
  //           doc.text(title, (pageWidth - titleWidth) / 2, headerHeight - 12);
  
  //           doc.setFontSize(12);
  //           const dateWidth = doc.getTextWidth(currentDate);
  //           doc.text(`${this.formatDateToDDMMYYYY(this.fromDate)} to ${this.formatDateToDDMMYYYY(this.toDate)}`, (pageWidth - dateWidth) /2.4, headerHeight - 4);
  
  //           doc.setLineWidth(0.5);
  //           doc.line(10, headerHeight, pageWidth - 10, headerHeight);
  //         };
  
  //         // Function to Draw Footer
  //         const drawFooter = (pageNum: number) => {
  //           doc.setFontSize(10);
  //           const footerText = `Page ${pageNum}`;
  //           const footerWidth = doc.getTextWidth(footerText);
  //           doc.text(
  //             footerText,
  //             (pageWidth - footerWidth) / 2,
  //             pageHeight - footerHeight + 12
  //           );
  //           doc.setLineWidth(0.5);
  //           doc.line(10, pageHeight - footerHeight, pageWidth - 10, pageHeight - footerHeight);
  //         };
  
  //         // Draw header for the first page
  //         drawHeader();
  //         let y = headerHeight + 5;
  //         let serialNumber = 1;
  //         drawFooter(1);
  
  //         for (const [vazhipad, entries] of Object.entries(this.groupedData)) {
  //           // Ensure font is correctly set for the group name
  //           doc.setFont("NotoSansMalayalam", "bold");
  //           doc.setFontSize(groupNameFontSize);
  
  //           if (y + 20 > pageHeight - footerHeight) {
  //             doc.addPage();
  //             drawHeader();
  //             drawFooter(doc.internal.pages.length);
  //             y = headerHeight + 5;
  //           }
  
  //           // Log group name to ensure it's rendering
  //           console.log('Rendering group name:', vazhipad);
  
  //           // Render group name
  //           doc.text(vazhipad, 14, y);
  //           y += 6;
  
  //           doc.setLineWidth(0.2);
  //           doc.line(14, y, pageWidth - 14, y);
  //           y += 3;
  
  //           // Draw table header
  //           doc.setFontSize(tableContentFontSize);
  //           doc.text('Sl No', 14, y + 5);
  //           doc.text('Name', 40, y + 5);
  //           doc.text('Star', 100, y + 5);
  //           doc.text('Qty', 140, y + 5);
  //           doc.text('', 180, y + 5);
  
  //           doc.line(10, y + lineHeight, pageWidth - 10, y + lineHeight);
  //           y += lineHeight + headerSpacing;
  
  //           const nameColumnWidth = 60;
  
  //           for (const entry of entries) {
  //             if (y + lineHeight > pageHeight - footerHeight) {
  //               doc.addPage();
  //               drawHeader();
  //               drawFooter(doc.internal.pages.length);
  //               y = headerHeight + 5;
  //             }
  
  //             doc.setFont("NotoSansMalayalam", "normal");
  //             doc.setFontSize(tableContentFontSize);
  
  //             doc.text(String(serialNumber), 14, y);
  
  //             const nameLines = doc.splitTextToSize(entry.Name, nameColumnWidth);
  //             const nameHeight = nameLines.length * lineHeight;
  
  //             doc.text(nameLines, 40, y);
  //             doc.text(entry.Star, 100, y);
  //             doc.text(String(entry.Qty), 140, y);
  //             doc.text(String(''), 180, y);
  
  //             y += nameHeight;
  //             serialNumber++;
  //           }
  
  //           y += smallSpacing;
  //         }
  
  //         drawFooter(doc.internal.pages.length);
  //         const pdfBlob = doc.output('blob');
  //         const pdfUrl = URL.createObjectURL(pdfBlob);
  //         window.open(pdfUrl, '_blank');
  //       },
  //       (error: any) => {
  //         console.error('Error loading font:', error);
  //       }
  //     );
  // }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
// pagechange for paginator
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

  genearatePDF(){
    const printContent = document.getElementById('print-section');
  if (!printContent) {
    console.error('No content found to print');
    return;
  }

  const WindowPrt = window.open('', '', 'width=800,height=600');
  
  // Check if the print window was successfully opened
  if (!WindowPrt) {
    console.error('Unable to open print window. Please check pop-up blockers.');
    return;
  }

  WindowPrt.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          /* Add custom styles for printing if needed */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 5px;
            text-align: left;
          }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
    </html>
  `);

  WindowPrt.document.close();
  WindowPrt.focus();

  // Make sure that the window is still valid before calling print and close
  if (WindowPrt) {
    WindowPrt.print();
    WindowPrt.close();
  } 
  }

  // generatePDF() {
  //   const pdfElement = document.getElementById('pdf-content');
  
  //   // Check if the element exists
  //   if (!pdfElement) {
  //     console.error('PDF content element not found.');
  //     return;
  //   }
  
  //   // Temporarily show the hidden content for rendering
  //   pdfElement.style.display = 'block';
  
  //   const options = {
  //     margin: 10,
  //     filename: `Vazhipad_Report_${this.formatDateToDDMMYYYY(this.fromDate)}_to_${this.formatDateToDDMMYYYY(this.toDate)}.pdf`,
  //     html2canvas: { scale: 3 },
  //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  //   };
  
  //   html2pdf()
  //     .set(options)
  //     .from(pdfElement)
  //     .save()
  //     .then(() => {
  //       // Hide the content after generating the PDF
  //       pdfElement.style.display = 'none';
  //     })
  //     .catch((error:any) => {
  //       console.error('Error generating PDF:', error);
  //     });
  // }
  


  // generatePDFs() {
  //   this.http
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

  //         // Example text in Malayalam
  //         const malayalamText = 'മലയാളം Vazhipad';

  //         // Add text to the PDF
  //         doc.text(malayalamText, 10, 10);

  //         // Open the PDF in a new tab
  //         const pdfBlob = doc.output('blob');
  //         const pdfUrl = URL.createObjectURL(pdfBlob);
  //         window.open(pdfUrl, '_blank');
  //       },
  //       (error:any) => {
  //         console.error('Error loading font:', error);
  //       }
  //     );
  // }





  }










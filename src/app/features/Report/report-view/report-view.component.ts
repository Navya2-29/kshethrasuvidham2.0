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

@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule,],
  templateUrl: './report-view.component.html',
  styleUrl: './report-view.component.css',
})
export class ReportViewComponent implements OnInit {
  
  displayedColumns: string[] = ['BillNo','BillDate','Prathista','Vazhipad', 'Name', 'Star', 'Qty', 'Rate', 'Amount',  'VazhiDate', ];
  dataSource = new MatTableDataSource<ReportData>();
  length = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
  constructor(private route: ActivatedRoute, private service: ReportService,private router: Router,private http: HttpClient ) {}

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


  generatePDF() {

    
     const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    this.http
      .get('assets/fonts/malayalam/NotoSansMalayalam-Regular.ttf', {
        responseType: 'arraybuffer',
      })
      .subscribe(
        (fontData) => {
          const doc = new jsPDF();

          // Convert ArrayBuffer to Base64
          const fontBase64 = btoa(
            String.fromCharCode(...new Uint8Array(fontData))
          );

          // Add the font to jsPDF
          doc.addFileToVFS(
            'NotoSansMalayalam-Regular.ttf',
            fontBase64
          );
          doc.addFont(
            'NotoSansMalayalam-Regular.ttf',
            'NotoSansMalayalam',
            'normal'
          );

          // Set the custom font
          doc.setFont('NotoSansMalayalam');
  
    const title = 'Vazhipad Report';
    const currentDate = new Date().toLocaleDateString('en-IN');
    const lineHeight = 8; // Row height for the table
    const smallSpacing = 4; // Space between groups
    const headerSpacing = 6; // Space between header and content
    const groupNameFontSize = 12; // Font size for group name
    const tableContentFontSize = 10; // Font size for table content
    const headerHeight = 20; // Height of header
    const footerHeight = 20; // Height of footer
  
    // Function to Draw Header
    const drawHeader = () => {
      doc.setFontSize(18); // Title font size
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, headerHeight - 12); // Title above header line
  
      doc.setFontSize(12); // Date font size
      const dateWidth = doc.getTextWidth(currentDate);
      doc.text(currentDate, (pageWidth - dateWidth) / 2, headerHeight - 4); // Date above header line
  
      // Draw a line under the header content
      doc.setLineWidth(0.5);
      doc.line(10, headerHeight, pageWidth - 10, headerHeight); // Line under header
    };
  
    // Function to Draw Footer
    const drawFooter = (pageNum: number) => {
      doc.setFontSize(10);
      const footerText = `Page ${pageNum}`;
      const footerWidth = doc.getTextWidth(footerText);
      doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - footerHeight + 12); // Footer content below footer line
  
      // Draw a line above the footer content
      doc.setLineWidth(0.5);
      doc.line(10, pageHeight - footerHeight, pageWidth - 10, pageHeight - footerHeight); // Line above footer
    };
  
    // Draw header for the first page
    drawHeader();
    
    let y = headerHeight + 5; // Starting Y position for content (after header)
    let serialNumber = 1;
  
    // Add footer to the first page (explicitly before adding any content)
    drawFooter(1); // Ensure footer is on the first page
  
    // Loop through grouped data
    for (const [vazhipad, entries] of Object.entries(this.groupedData)) {
      if (y + 20 > pageHeight - footerHeight) {
        doc.addPage();
        drawHeader(); // Draw header again on the new page
        drawFooter(doc.internal.pages.length); // Draw footer on new page with correct page number
        y = headerHeight + 5; // Reset Y position for new page (after header)
      }
  
      // Draw group header (Group name font size reduced)
      doc.setFontSize(groupNameFontSize);
// doc.setFont("Helvetica", "bold"); // Bold font for group name
      doc.text(vazhipad, 14, y); // Group title
      y += 6; // Space after group title
  
      // Add thin line under group name
      doc.setLineWidth(0.2); // Set a thin line
      doc.line(14, y, pageWidth - 14, y); // Draw line under group name
  
      y += 3; // Space after thin line before table header
  
      // Draw table header for the group (Table header font size reduced)
      doc.setFontSize(tableContentFontSize); // Font size for table content
      doc.setTextColor(0, 0, 0); // Set text color
      doc.text('Sl No', 14, y + 5);
      doc.text('Name', 40, y + 5);
      doc.text('Star', 100, y + 5); // Adjusted the X-position to leave space for Name column
      doc.text('Qty', 140, y + 5);
      doc.text('BillNo', 180, y + 5);
  
      // Line below header
      doc.line(10, y + lineHeight, pageWidth - 10, y + lineHeight);
  
      y += lineHeight + headerSpacing; // Move down after header
  
      // Set maximum width for Name column
      const nameColumnWidth = 60; // Max width for Name column
  
      // Loop through the entries in the group
      for (const entry of entries) {
        // Check for page break
        if (y + lineHeight > pageHeight - footerHeight) {
          doc.addPage();
          drawHeader(); // Draw header again on the new page
          drawFooter(doc.internal.pages.length); // Add footer with page number
          y = headerHeight + 5; // Reset Y position for new page (after header)
        }
  
        // Table Content (without grid lines, only text)
 // doc.setFont("Helvetica", "normal");
        doc.setFontSize(tableContentFontSize); // Use the content font size for table rows
  
        // Serial Number
        doc.text(String(serialNumber), 14, y);
  
        // Name (Wrap text if needed)
        const nameLines = doc.splitTextToSize(entry.Name, nameColumnWidth);
        const nameHeight = nameLines.length * lineHeight; // Calculate height for name lines
  
        doc.text(nameLines, 40, y); // Draw wrapped name text
  
        // Other Columns (no wrapping needed)
        doc.text(entry.Star, 100, y);
        doc.text(String(entry.Qty), 140, y);
        doc.text(String(entry.BillNo), 180, y);
  
        // Adjust Y position based on the number of lines in Name column
        y += nameHeight; // Adjust Y position based on the wrapped name lines
        serialNumber++;
      }
  
      y += smallSpacing; // Space between groups
    }
  
    // Draw footer on the last page
    drawFooter(doc.internal.pages.length);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    // doc.save('vazhipad_report_with_header_footer.pdf');



  },
  (error:any) => {
    console.error('Error loading font:', error);
  }
);
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
// pagechange for paginator
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
  
  goBack(): void {
    console.log('Going back...'); // Log to verify method execution
    this.router.navigate(['/getReport']);
  }





  generatePDFs() {
    this.http
      .get('assets/fonts/malayalam/NotoSansMalayalam-Regular.ttf', {
        responseType: 'arraybuffer',
      })
      .subscribe(
        (fontData) => {
          const doc = new jsPDF();

          // Convert ArrayBuffer to Base64
          const fontBase64 = btoa(
            String.fromCharCode(...new Uint8Array(fontData))
          );

          // Add the font to jsPDF
          doc.addFileToVFS(
            'NotoSansMalayalam-Regular.ttf',
            fontBase64
          );
          doc.addFont(
            'NotoSansMalayalam-Regular.ttf',
            'NotoSansMalayalam',
            'normal'
          );

          // Set the custom font
          doc.setFont('NotoSansMalayalam');

          // Example text in Malayalam
          const malayalamText = 'മലയാളം Vazhipad';

          // Add text to the PDF
          doc.text(malayalamText, 10, 10);

          // Open the PDF in a new tab
          const pdfBlob = doc.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, '_blank');
        },
        (error:any) => {
          console.error('Error loading font:', error);
        }
      );
  }
  }










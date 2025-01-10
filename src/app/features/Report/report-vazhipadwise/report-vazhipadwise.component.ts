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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';

import * as pdfMake from 'pdfmake/build/pdfmake';  // Import pdfMake
import * as pdfFonts from 'pdfmake/build/vfs_fonts'; 
interface ConsolidatedData {
  Vazhipad: string;
  TotalQty: number; // Renamed for clarity
}
// export function setFonts() {
//   pdfMake.vfs = pdfFonts.pdfMake.vfs;
// // Define custom fonts
// pdfMake.fonts = {
//   malayalamFont: {
//     normal: 'assets/fonts/malayalam/NotoSansMalayalam-Regular.ttf', // Path to the font file
//     bold: 'assets/fonts/malayalam/NotoSansMalayalam-Bold.ttf ',  // Use the same font for bold
//     italics: 'assets/fonts/malayalam/NotoSansMalayalam-Thin.ttf ',  // Use the same font for italics
//     bolditalics: 'assets/fonts/malayalam/NotoSansMalayalam-SemiBold.ttf '  // Use the same font for bold-italics
//   }
// };
// }

@Component({
  selector: 'app-report-vazhipadwise',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatPaginatorModule,HeaderComponent,MatTooltipModule,MatFormFieldModule, MatInputModule],
  templateUrl: './report-vazhipadwise.component.html',
  styleUrl: './report-vazhipadwise.component.css'
})
export class ReportVazhipadwiseComponent {
 displayedColumns: string[] = ['SINo','VAZHIPAD',  'QUANTITY', ];
  dataSource = new MatTableDataSource<ConsolidatedData>();
  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10,50,100,200,300,500,1000];
  pageIndex = 0;
  data:ReportData[]=[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  groupedData: { [key: string]: ReportData[] } = {};
fromDate:string;
toDate:string;
prathista:string;
vazhipad:string;
  consolidatedData: ConsolidatedData[] = [];

  constructor(private route: ActivatedRoute, private service: ReportService,private router: Router,  private http:HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this. prathista = params['Prathishta'];
      this. vazhipad=params['Vazhipad'];
      this. fromDate = params['fromDate'];
      this. toDate = params['toDate'];
      this.fetchReportData( this.fromDate, this.toDate);
    });
  }



 // Call your API service to get the report data
  fetchReportData( fromDate: string, toDate: string): void {
    const payLoad = {
      Type: "vazhipad",
      FromDate: this.formatDateToDDMMYYYY(fromDate),
      ToDate:this.formatDateToDDMMYYYY( toDate),
      PMId:this.prathista,
      VazhId:this.vazhipad.trim()
    };
    console.log(payLoad,"ppp")
    this.service.getVazhipadWiseReport(payLoad).subscribe({
      next: (data) => {
        console.log('Fetched report data:', data);
        this.data=data;
       
      this.consolidateData()
      
        this.dataSource.data = this.consolidatedData
        this.length =this.consolidatedData.length; 
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

  




  consolidateData() {
    this.consolidatedData = this.data.reduce((acc: ConsolidatedData[], current: ReportData) => {
      // Convert Qty to a number if it's a string
      const qty = typeof current.Qty === 'string' ? parseFloat(current.Qty) : current.Qty;

      // Find if the Vazhipad already exists in the accumulator
      const existing = acc.find(item => item.Vazhipad === current.Vazhipad);

      if (existing) {
        // If it exists, add the quantity
        existing.TotalQty += qty; // Use the converted qty
      } else {
        // If it doesn't exist, push a new object with the current Vazhipad and Qty
        acc.push({ Vazhipad: current.Vazhipad, TotalQty: qty }); // Use the converted qty
      }

      return acc;
    }, []);
    this.consolidatedData.sort((a, b) => a.Vazhipad.localeCompare(b.Vazhipad));
    console.log(this.consolidatedData); // Corrected reference to consolidatedData
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
   
formatDateToDDMMYYYY(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

multiLangData = {
  en: 'Hello, welcome to our temple!',
  hi: 'नमस्ते, हमारे मंदिर में स्वागत है!',
  ta: 'வணக்கம், எங்கள் கோயிலுக்கு வரவேற்கின்றேன்!'
};

generatePDF() {
 
  const documentDefinition = {
    content: [
      { text: 'Hello, world!', fontSize: 15 },
      { text: 'This is a Malayalam example: ', fontSize: 15 },
      { text: 'ഹലോ ലോകം', fontSize: 15, font: 'malayalamFont' }, // Malayalam text
    ]
  };

  pdfMake.createPdf(documentDefinition).download('malayalam-example.pdf');
  
}

  
  
}

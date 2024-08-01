import { Component, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MasterService } from '../../../services/master/master.service';
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
  imports: [MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatCheckboxModule],
  templateUrl: './search-by-bill-number.component.html',
  styleUrl: './search-by-bill-number.component.css'
})
export class SearchByBillNumberComponent {
  displayedColumns: string[] = [
    'Vazhipad',
    'Name',
    'Star',
    'Diety',
    'Qty',
    'Rate',
    'Amount',
  ];
  dataSource: MatTableDataSource<Data>;
  lastBillNo: any;;
  starData: { [id: string]: string } = {};
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialogRef: MatDialogRef<SearchByBillNumberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private masterService: MasterService
  ) {
    this.lastBillNo = data[0].BillNo;
    this.dataSource = new MatTableDataSource(data);
  }
  
  ngOnInit() {
    this.loadStarData();
    
  }
 
  getNakshthram(id: string): string {
    return this.starData[id] || 'Unknown'; // Return 'Unknown' if ID not found
  }
    loadStarData(): void {
      const payLoad={"Type":"ListStar","Code":""}
      this.masterService.getStarData(payLoad).subscribe({
        next: (data: any[]) => { 
          console.log(data)// Specify that data is an array of Star
          this.starData = data.reduce((acc: { [id: string]: string }, star:any) => {
            acc[star.id] = star.SM_NameEng;
            return acc;
          }, {});
  
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
}

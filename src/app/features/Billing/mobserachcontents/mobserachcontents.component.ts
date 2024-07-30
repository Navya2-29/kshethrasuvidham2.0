import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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

// const ELEMENT_DATA: PeriodicElement[] = [
//   {position: 1, vazhipad:'pushpanjali', name: 'Ramu', star: 'Thiruvathira', diety: 'Siva', qty: 2, rate: 2500, amount: 5000, time: 'രാവിലെ'},
//   {position: 2, vazhipad:'pushpanjali', name: 'Marthandavarma', star: 'Aswathy', diety: 'Vishnu', qty: 2, rate: 2500, amount: 5000, time: 'രാവിലെ'},
//   {position: 3, vazhipad:'pushpanjali', name: 'Rajasekharan', star: 'Karthika', diety: 'Ganapathy', qty: 2, rate: 2500, amount: 5000, time: 'രാവിലെ'},
//   {position: 4, vazhipad:'pushpanjali', name: 'Krishnan Namboothiri', star: 'Rohini', diety: 'Siva', qty: 2, rate: 2500, amount: 5000, time: 'രാവിലെ'},
//   {position: 5, vazhipad:'pushpanjali', name: 'Mohana varma Thampuran', star: 'Makayiram', diety: 'Ganapathy', qty: 2, rate: 2500, amount: 5000, time: 'രാവിലെ'},
//   {position: 6, vazhipad:'pushpanjali', name: 'Ramesh', star: 'Punartham', diety: 'Ganapathy', qty: 2, rate: 2500, amount: 5000, time: 'രാവിലെ'},
//   {position: 7, vazhipad:'pushpanjali', name: 'Jayan', star: 'Thiruvathira', diety: 'Siva', qty: 2, rate: 2500, amount: 5000, time: 'രാവിലെ'},
//   {position: 8, vazhipad:'pushpanjali', name: 'Jayan Ravi', star: 'Thiruvathira', diety: 'Siva', qty: 2, rate: 2500, amount: 5000, time: 'രാവിലെ'},

// ];

@Component({
  selector: 'app-mobserachcontents',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatCheckboxModule,
  ],
  templateUrl: './mobserachcontents.component.html',
  styleUrl: './mobserachcontents.component.css',
})
export class MobserachcontentsComponent implements OnInit {
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
  mobilenumber: string = '';
  starData: { [id: string]: string } = {};
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialogRef: MatDialogRef<MobserachcontentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private masterService: MasterService
  ) {
    this.mobilenumber = data[0].MobileNo;
    this.dataSource = new MatTableDataSource(data);
  }
  // displayedColumns: string[] = ['select', 'vazhipad', 'name', 'star', 'diety', 'qty', 'rate', 'amount', 'time'];
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  // selection = new SelectionModel<PeriodicElement>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.dataSource.data.length;
  //   return numSelected === numRows;
  // }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  // toggleAllRows() {
  //   if (this.isAllSelected()) {
  //     this.selection.clear();
  //     return;
  //   }

  //   this.selection.select(...this.dataSource.data);
  // }

  /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: PeriodicElement): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  //   }
  //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  // }
  ngOnInit() {
    this.loadStarData();
    
  }
  // getNakshthram() {
  //   const payLoad = { Type: 'ListStar', Code: '' };
  //   this.masterService.getStarData(payLoad).subscribe({
  //     next: (data) => {
  //       console.log(data);
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     },
  //   });
  // }
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

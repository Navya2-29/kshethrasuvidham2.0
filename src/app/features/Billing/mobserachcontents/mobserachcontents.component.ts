import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MasterService } from '../../../services/master/master.service';
import { CommonModule } from '@angular/common';

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
  selector: 'app-mobserachcontents',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatCheckboxModule,
    CommonModule,
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
    'Date',
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

  ngOnInit() {
    this.loadStarData();
  }

  getNakshthram(id: string): string {
    return this.starData[id] || 'Unknown'; 
  }
  loadStarData(): void {
    const payLoad = { Type: 'ListStar', Code: '' };
    this.masterService.getStarData(payLoad).subscribe({
      next: (data: any[]) => {
        console.log(data);
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
}

import { Component, Inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MasterService } from '../../../services/master/master.service';
export interface DataRow {
  Name: string;
  Star: string;
}

@Component({
  selector: 'app-billing-via-mobilenumber',
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule],
  templateUrl: './billing-via-mobilenumber.component.html',
  styleUrl: './billing-via-mobilenumber.component.css'
})
export class BillingViaMobilenumberComponent implements OnInit {
  displayedColumns: string[] = ['select', 'name', 'star'];
  dataSource: DataRow[] = []
    
  selectedRows = new Set<DataRow>();
  mobileNumber: string;

  constructor(
    public dialogRef: MatDialogRef<BillingViaMobilenumberComponent >,
    @Inject(MAT_DIALOG_DATA) public data: { mobileNumber: string },
    private service:MasterService
  ) {
    this.mobileNumber = data.mobileNumber // Pass mobile number from parent
  }

  ngOnInit(): void {
    this.getDevoteeData(this.mobileNumber);
  }


  getDevoteeData(mobile:string){
    const PayLoad={
      Type:"NameStar",
      Code:this.mobileNumber
    }
   this.service.getMaster(PayLoad).subscribe({
      next:(data)=>{
this.dataSource=data;
console.log(this.dataSource,"data mobile")
    },error:(err)=>{
       
    }
   })
  }

  isAllSelected() {
    return this.selectedRows.size === this.dataSource.length;
  }

  isIndeterminate() {
    return this.selectedRows.size > 0 && !this.isAllSelected();
  }

  toggleSelection(row: DataRow) {
    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selectedRows.clear();
    } else {
      this.dataSource.forEach((row) => this.selectedRows.add(row));
    }
  }

  isSelected(row: DataRow) {
    return this.selectedRows.has(row);
  }

  onCancel() {
    this.dialogRef.close(null); // Close dialog without data
  }

  onSubmit() {
    console.log(Array.from(this.selectedRows))
    this.dialogRef.close(Array.from(this.selectedRows)); // Pass selected rows to parent
  }
}

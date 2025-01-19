import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
export interface DataRow {
  name: string;
  star: string;
}

@Component({
  selector: 'app-billing-via-mobilenumber',
  standalone: true,
  imports: [MatTableModule, MatCheckboxModule],
  templateUrl: './billing-via-mobilenumber.component.html',
  styleUrl: './billing-via-mobilenumber.component.css'
})
export class BillingViaMobilenumberComponent {
  displayedColumns: string[] = ['select', 'name', 'star'];
  dataSource: DataRow[] = [
    { name: 'John', star: "അശ്വതി"},
    { name: 'Jane', star: "അശ്വതി" },
    { name: 'Smith', star: "അശ്വതി" },
  ];
  selectedRows = new Set<DataRow>();
  mobileNumber: string;

  constructor(
    public dialogRef: MatDialogRef<BillingViaMobilenumberComponent >,
   
  ) {
    this.mobileNumber = "123456789" // Pass mobile number from parent
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

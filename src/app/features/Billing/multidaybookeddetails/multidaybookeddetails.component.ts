import { vazhipad } from './../../../othervazhipad/othervazhipad.component';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon'
import { TotalAmountService } from '../../../shared/service/total-amount.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multidaybookeddetails',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatTableModule, MatCheckboxModule,MatIconModule,CommonModule],
  templateUrl: './multidaybookeddetails.component.html',
  styleUrl: './multidaybookeddetails.component.css'
})
export class MultidaybookeddetailsComponent implements OnInit {
  devoteeDetails:any[]=[];
  starDate:Date;
  lastDAte:Date;
 vazhipad:string;
  constructor(
    private dialogRef: MatDialogRef<MultidaybookeddetailsComponent>,
    private multidayService: TotalAmountService,
    @Inject(MAT_DIALOG_DATA) public data: any
   
  ) {
    // Access the passed data here
    console.log(data)
    console.log("hai");
  }
ngOnInit() {
  let lastIndex = this.data.length - 1;
this.devoteeDetails=this.data.devoteedetails;
this.starDate=this.data[0].VazhipadDate;
this.lastDAte=this.data[lastIndex].VazhipadDate
this.vazhipad=this.data[0].Vazhipad;
}
onSubmit(){
this.dialogRef.close()
}
cancel(){
  this.dialogRef.close()

}
 
}

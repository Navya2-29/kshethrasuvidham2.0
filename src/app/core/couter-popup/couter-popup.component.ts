import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-couter-popup',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './couter-popup.component.html',
  styleUrl: './couter-popup.component.css'
})
export class CouterPopupComponent {

  counterId: string = '';
  constructor(public dialogRef: MatDialogRef<CouterPopupComponent>) {} 

  save(): void {
    this.dialogRef.close(this.counterId);
  }



}

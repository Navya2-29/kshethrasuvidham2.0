import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MasterService } from '../../../services/master/master.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CouterPopupComponent } from '../../couter-popup/couter-popup.component';

@Component({
  selector: 'app-front',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './front.component.html',
  styleUrl: './front.component.css',
})
export class FrontComponent {
  hide: boolean = true;
  loading: boolean = false;
  errorMessage = '';
  templeName: string | null;
  logo: string | null;
  todayDate: Date = new Date();

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private service: MasterService,
    
  ) {}
  ngOnInit(): void {
    this.templeName = localStorage.getItem('TempleName');
    this.logo = localStorage.getItem('Logo');
    const storedCounterId = localStorage.getItem('counterId');
          if (!storedCounterId) {
           
            this.openCounterIdDialog();
            
          }
  }

  getLogoUrl(): string {
    return `assets/images/${this.logo}`; // Assuming logo images are stored in the 'assets/images' folder
  }




  openCounterIdDialog(): void {
    const dialogRef = this.dialog.open(CouterPopupComponent, {
      width: '300px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Store the entered Counter ID in localStorage
        const payLoad = {
          Type:"CounterId",
          Code:result
        };
  
        this.service.getMaster(payLoad).subscribe((data) => {
       console.log(data);
       localStorage.setItem('counterId', result);
        });

      }
    });
  }

}

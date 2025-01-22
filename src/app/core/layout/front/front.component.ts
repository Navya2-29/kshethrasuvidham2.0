import { MasterService } from './../../../services/master/master.service';
import { ToastrService } from 'ngx-toastr';
import { AfterViewInit, Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CouterPopupComponent } from '../../couter-popup/couter-popup.component';
import { AuthService } from '../../auth/service/auth.service';

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
export class FrontComponent implements AfterViewInit {
  hide: boolean = true;
  loading: boolean = false;
  errorMessage = '';
  templeName: string | null;
  logo: string | null;
  todayDate: Date = new Date();
  Role: string | null;
  countercount: number;
  allowedContercount: number | null;
  @ViewChild('billingButton') billingButton: ElementRef | undefined;
  @ViewChild('reportButton') reportButton: ElementRef | undefined;
  @ViewChild('nadavaruButton') nadavaruButton: ElementRef | undefined;
  buttons: ElementRef[] = [];
  currentIndex: number = 0;
  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private service: MasterService,
    private notification: ToastrService,
    private renderer: Renderer2,
    private router: Router,
    private authService:AuthService
  ) {
    this.templeName = localStorage.getItem('TempleName');
    this.logo = localStorage.getItem('Logo');
    // this.Role = localStorage.getItem('Role');
    this.allowedContercount = Number(localStorage.getItem('Counter'));
    this.Role = localStorage.getItem('Role');
    console.log(this.allowedContercount, 'ss');
    this.getcounterCount();

    console.log(this.countercount > this.allowedContercount, 'bbb');
  }
  ngOnInit(): void {
    const storedCounterId = localStorage.getItem('counterId');
    if (!storedCounterId) {
      this.openCounterIdDialog();
    }
    sessionStorage.setItem('isPageRefreshed', 'true');
  }

  getLogoUrl(): string {
    return `assets/images/${this.logo}`; // Assuming logo images are stored in the 'assets/images' folder
  }

  ngAfterViewInit(): void {
    this.buttons = [
      this.billingButton!,
      this.reportButton!,
      this.nadavaruButton!,
    ];
    this.focusButton(this.currentIndex);
    
    // Listen for keydown events to navigate with arrow keys
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  onKeyDown(event: KeyboardEvent): void {
    // Arrow Up (38) and Arrow Down (40)
    if (event.key === 'ArrowDown') {
      this.currentIndex = (this.currentIndex + 1) % this.buttons.length;
      this.focusButton(this.currentIndex);
    } else if (event.key === 'ArrowUp') {
      this.currentIndex = (this.currentIndex - 1 + this.buttons.length) % this.buttons.length;
      this.focusButton(this.currentIndex);
    }
    // Enter Key (13)
    if (event.key === 'Enter') {
      this.navigate();
    }
  }

  focusButton(index: number): void {
    // Remove previous focus
    this.buttons.forEach((button) => {
      this.renderer.removeClass(button.nativeElement, 'focused');
    });

    // Add focus to the current button
    this.renderer.addClass(this.buttons[index].nativeElement, 'focused');
    this.buttons[index].nativeElement.focus();
  }

  navigate(): void {
    const currentButton = this.buttons[this.currentIndex].nativeElement;
    if (currentButton.routerLink) {
      this.router.navigate([currentButton.routerLink]);
    }
  }

  openCounterIdDialog(): void {
    const dialogRef = this.dialog.open(CouterPopupComponent, {
      width: '300px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Store the entered Counter ID in localStorage
        this.getcounterCount();
        if (this.Role == 'admin' || this.Role == 'super' ) {
          localStorage.setItem('counterId', result);
        } else {

          const payLoad = {
            Type: 'CounterId',
            Code: result,
          };
          if (
            this.countercount != null &&
            this.allowedContercount != null &&
            this.countercount >= this.allowedContercount
          ) {
            this.notification.error(
              'Counter limit exceeded. Please contact the Kshethrasuvidham for assistance.'
            );
            this.openCounterIdDialog();
          } else {
           
              this.service.ADDCOUNTER(payLoad).subscribe((data: any) => {
                console.log(data, 'sass');
                if (data.RespStatus === 'I') {
                  localStorage.setItem('counterId', result);
                } else {
                  this.openCounterIdDialog();
                }
              });
            
          }
        }
      }
    });
  }

  getcounterCount() {
    const payLoad = {
      Type: 'CounterCount',
      Code: '',
    };
    this.service.getMaster(payLoad).subscribe((data) => {
      console.log(data);
      this.countercount = data[0].cnt;
      console.log(this.countercount, 'cc');
      // if (this.countercount != null && this.allowedContercount != null && this.countercount > this.allowedContercount) {
      //   this.openCounterIdDialog()
      // }
    });
  }


  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: Event): void {
    // Check if the session storage indicates a page refresh
    const isPageRefreshed = sessionStorage.getItem('isPageRefreshed') === 'true';

    if (!isPageRefreshed) {
      // Perform logout or session cleanup if not a page refresh
      this.authService.logout();
    }

    // Remove the flag to prepare for next load
    sessionStorage.removeItem('isPageRefreshed');
  }

}

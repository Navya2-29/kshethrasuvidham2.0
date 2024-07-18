import { NotificationService } from './../../../services/notification/notification.service';
import { ToastrService } from 'ngx-toastr';
import { Directive, ElementRef, HostListener } from '@angular/core';


@Directive({
  selector: '[appNumber]',
  standalone: true
})
export class NumberDirective {
  constructor(private el: ElementRef,private notification:NotificationService) {}
  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const allowedKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (event.key === '0') {
      event.preventDefault();
      this.notification.showError("0 is not a valid Rate");
      return;
    }
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
    const inputValue = this.el.nativeElement.value;
    if (inputValue.length >= 5) {
      event.preventDefault();
    }
  
  }
}

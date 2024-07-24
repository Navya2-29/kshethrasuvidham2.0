import { Directive, ElementRef, HostListener } from '@angular/core';
import { NotificationService } from './../../../services/notification/notification.service';

@Directive({
  selector: '[appNumber]',
  standalone: true
})
export class NumberDirective {
  private readonly allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  private readonly controlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];

  constructor(
    private el: ElementRef,
    private notification: NotificationService
  ) {}

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const inputValue = this.el.nativeElement.value;

    // Check if 0 is entered as the first digit
    if (event.key === '0' && inputValue.length === 0) {
      event.preventDefault();
      this.notification.showError("0 is not valid");
      return;
    }

    // Allow only allowed keys and control keys
    if (!this.allowedKeys.includes(event.key) && !this.controlKeys.includes(event.key)) {
      event.preventDefault();
    }

    // Restrict length to a maximum of 5 digits
    if (inputValue.length >= 5 && !this.controlKeys.includes(event.key)) {
      event.preventDefault();
      this.notification.showError("Maximum length reached");
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData?.getData('text');
    if (!clipboardData) return;

    // Check if pasted value starts with 0
    if (clipboardData.startsWith('0')) {
      event.preventDefault();
      this.notification.showError("0 cannot be the first digit");
      return;
    }

    // Check if pasted value is valid and not exceeding the length
    const isInvalid = clipboardData.split('').some(char => !this.allowedKeys.includes(char));
    if (isInvalid || clipboardData.length > 5) {
      event.preventDefault();
      this.notification.showError("Pasting invalid input is not allowed");
    }
  }
}

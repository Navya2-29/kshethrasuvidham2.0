import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QzTrayService } from '../../../shared/service/qz-tray.service';

@Component({
  selector: 'app-print-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './print-settings.component.html',
  styleUrl: './print-settings.component.css'
})
export class PrintSettingsComponent implements OnInit {
  isConnected = false;
  isConnecting = false;
  errorMessage = '';
  successMessage = '';
  printers: string[] = [];
  selectedPrinter = '';
  defaultPrinter = '';

  constructor(private qzService: QzTrayService) {}

  async ngOnInit(): Promise<void> {
    await this.checkStatusAndLoadPrinters();
  }

  async checkStatusAndLoadPrinters(): Promise<void> {
    this.isConnecting = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await this.qzService.connect();
      this.isConnected = this.qzService.isWebSocketActive();
      if (this.isConnected) {
        this.printers = await this.qzService.getPrinters();
        this.defaultPrinter = await this.qzService.getDefaultPrinter();
        this.selectedPrinter = await this.qzService.getPreferredPrinter();
      }
    } catch (err: any) {
      this.isConnected = false;
      this.errorMessage =
        err?.message ||
        'Unable to connect to QZ Tray. Ensure QZ Tray desktop app is running on this PC.';
    } finally {
      this.isConnecting = false;
    }
  }

  onPrinterSelected(printer: string): void {
    this.selectedPrinter = printer;
    this.qzService.setPreferredPrinter(printer);
    this.successMessage = `Active printer set to: ${printer}`;
  }

  async testPrint(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const testHtml = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="margin: 0;">QZ TRAY SILENT PRINT TEST</h2>
          <hr/>
          <p>Printer: <strong>${this.selectedPrinter || this.defaultPrinter}</strong></p>
          <p>Date & Time: ${new Date().toLocaleString()}</p>
          <p style="color: green; font-weight: bold;">Direct Silent Printing is Working!</p>
          <hr/>
        </div>
      `;
      await this.qzService.printHtml(testHtml, {
        printerName: this.selectedPrinter || this.defaultPrinter
      });
      this.successMessage = 'Test print sent successfully to printer!';
    } catch (err: any) {
      this.errorMessage = `Print failed: ${err?.message || err}`;
    }
  }
}

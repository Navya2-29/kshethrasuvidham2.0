import { Injectable } from '@angular/core';
import * as qz from 'qz-tray';

export interface QzPrintOptions {
  printerName?: string;
  colorType?: qz.ColorType;
  copies?: number;
  margins?: number | qz.Margins;
  scaleContent?: boolean;
  rasterize?: boolean;
  size?: qz.Size;
  units?: qz.Units;
}

@Injectable({
  providedIn: 'root'
})
export class QzTrayService {
  private isConnecting = false;

  constructor() {}

  /**
   * Check if WebSocket connection to QZ Tray is active
   */
  isWebSocketActive(): boolean {
    try {
      return qz.websocket.isActive();
    } catch {
      return false;
    }
  }

  /**
   * Connect to local QZ Tray instance running on laptop/PC
   */
  async connect(): Promise<void> {
    if (this.isWebSocketActive()) {
      return;
    }

    if (this.isConnecting) {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    }

    this.isConnecting = true;
    try {
      await qz.websocket.connect({
        retries: 2,
        delay: 1,
        keepAlive: 60
      });
      console.log('Connected to QZ Tray successfully');
    } catch (error) {
      console.error('Failed to connect to QZ Tray:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from QZ Tray
   */
  async disconnect(): Promise<void> {
    if (this.isWebSocketActive()) {
      await qz.websocket.disconnect();
    }
  }

  /**
   * Get list of all installed printers on the system
   */
  async getPrinters(): Promise<string[]> {
    await this.connect();
    const result = await qz.printers.find();
    if (Array.isArray(result)) {
      return result;
    }
    return result ? [result] : [];
  }

  /**
   * Get the system default printer
   */
  async getDefaultPrinter(): Promise<string> {
    await this.connect();
    return await qz.printers.getDefault();
  }

  /**
   * Set preferred printer name in localStorage
   */
  setPreferredPrinter(printerName: string): void {
    localStorage.setItem('qz_selected_printer', printerName);
  }

  /**
   * Get preferred printer name from localStorage or return default system printer
   */
  async getPreferredPrinter(): Promise<string> {
    // 1. Saved printer in localStorage
    const saved = localStorage.getItem('qz_selected_printer');
    if (saved && saved.trim() !== '') {
      return saved;
    }

    // 2. Try default Windows printer
    try {
      const def = await this.getDefaultPrinter();
      if (def && typeof def === 'string' && def.trim() !== '') {
        return def;
      }
    } catch (err) {
      console.warn('Could not query default printer:', err);
    }

    // 3. Fallback: first available printer in the printer list
    try {
      const printers = await this.getPrinters();
      if (printers && printers.length > 0) {
        return printers[0];
      }
    } catch (err) {
      console.warn('Could not list printers:', err);
    }

    throw new Error('No printer detected. Please make sure a printer is installed in Windows.');
  }

  /**
   * Print raw HTML content directly to the printer without showing the browser print dialog
   * @param htmlContent Full HTML string including inline CSS or styles
   * @param options Printing options (printerName, margins, copies, scale, etc.)
   */
  async printHtml(htmlContent: string, options?: QzPrintOptions): Promise<void> {
    await this.connect();

    // Determine target printer
    const targetPrinter = options?.printerName || (await this.getPreferredPrinter());
    if (!targetPrinter) {
      throw new Error('No printer found. Please select or install a printer in Windows.');
    }

    // Build configuration
    const configOptions: qz.PrinterOptions = {
      colorType: options?.colorType || 'color',
      copies: options?.copies || 1,
      margins: options?.margins !== undefined ? options.margins : 0,
      scaleContent: options?.scaleContent !== undefined ? options.scaleContent : true,
      rasterize: options?.rasterize !== undefined ? options.rasterize : true
    };

    if (options?.size) {
      configOptions.size = options.size;
    }
    if (options?.units) {
      configOptions.units = options.units;
    }

    const config = qz.configs.create(targetPrinter, configOptions);

    const printData: qz.PrintData[] = [
      {
        type: 'pixel',
        format: 'html',
        flavor: 'plain',
        data: htmlContent
      }
    ];

    console.log(`Sending direct silent print to "${targetPrinter}" via QZ Tray...`);
    await qz.print(config, printData);
    console.log('Direct silent print completed successfully.');
  }

  /**
   * Print raw ESC/POS or text commands directly (for thermal receipt printers)
   */
  async printRaw(data: any[], printerName?: string): Promise<void> {
    await this.connect();
    const targetPrinter = printerName || (await this.getPreferredPrinter());
    const config = qz.configs.create(targetPrinter);
    await qz.print(config, data);
  }
}

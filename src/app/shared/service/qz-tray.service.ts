import { Injectable } from '@angular/core';
import * as qz from 'qz-tray';
import { KEYUTIL, KJUR, hextorstr, stob64 } from 'jsrsasign';

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

// Digital certificate generated and trusted by QZ Tray
const QZ_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIEMDCCAxigAwIBAgIGAaEixkIgMA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS
UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx
HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg
RGVtbyBDZXJ0MB4XDTI2MTAwODIyMjYyMFoXDTQ2MTAwODIyMjYyMFowgaIxCzAJ
BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD
VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs
IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog
VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCZ
cx6Ajt9qXeBKDKx1nG/Lm10AdXSqio6Huz69l6arD8WjWB20E4bvQi3FaFIait7G
5ybQ8MYkvrhsmpFFF5W+/lBFfk3AM9ZOc4rVooWL/xMg01dvv5gTIG1tDzzuoqnp
5prtLtvurSPuluPn0RuVbx2TguLryuq5v4oMCrQoDRsQcXRm11yhZiCFT6xXesmt
mcpUViIuXtf3Sag8tJfV8Q5co9BKscCurkEPY/z5lkIk1vQ0quykdpumbJT72As4
bVt1HeCXETbZsFHuS/3MZn0a9UL6wJVrOZ+djo8tjluKStaBo/hSEs7eWCWKiyPK
DZvRoWy8FjgtlTa7E2eDAgMBAAGjajBoMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBTaJdGN+jdU8GXyQe6V5yBMRN6iuTAjBgNV
HR4BAf8EGTAXoBUwE4IRUVogVHJheSBEZW1vIENlcnQwDQYJKoZIhvcNAQELBQAD
ggEBAEgo5qY1AcrwzXElYi+1OjmnQTOa7fNRZqIx4lD/ST/UmH3B7VvCHNFU4ea5
nfHMWEIE1hrrY9xhhInXCbiOW8UYrm8Gng8QXlOYZSlK4xtuuI9xq6OL5gCpCMIj
vh5zLlbclVQ7ZfybnyIiL3bKoSQmOmFjoDYMclpX9IgGdtVsk19wX10t9z1A46XZ
GkBH4T9DjWbJcyCC41JmcFJcPMs8N9z7Y9XJPTbZxba7bpbTH26lbpwWlWWkxuFL
wN3M2mCyYvxrQukJjtMfwZMKvGAueLcBK7abnfivmVo+8QRcklWgLWBks3uRHpxr
7MnwhAktfG0WZeYtq2LCRRL3bD8=
-----END CERTIFICATE-----`;

// Matching private key for cryptographic signing
const QZ_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCZcx6Ajt9qXeBK
DKx1nG/Lm10AdXSqio6Huz69l6arD8WjWB20E4bvQi3FaFIait7G5ybQ8MYkvrhs
mpFFF5W+/lBFfk3AM9ZOc4rVooWL/xMg01dvv5gTIG1tDzzuoqnp5prtLtvurSPu
luPn0RuVbx2TguLryuq5v4oMCrQoDRsQcXRm11yhZiCFT6xXesmtmcpUViIuXtf3
Sag8tJfV8Q5co9BKscCurkEPY/z5lkIk1vQ0quykdpumbJT72As4bVt1HeCXETbZ
sFHuS/3MZn0a9UL6wJVrOZ+djo8tjluKStaBo/hSEs7eWCWKiyPKDZvRoWy8Fjgt
lTa7E2eDAgMBAAECggEAEn99KCmQ/IU6j31S9jlDL3vtdyuxl7QXldHYW19CWTwP
1YQUI0F4sl5Q9DYs3O7sB3WVXqStI4Arl/P+GnfLC84j0Rd2ZKVwaolP2DcSUEZn
K5LZPIBlOGZf/+tRVhcdJ97ZGEneJg87K1Ix68pvv9Di84WuDeyqj8prks4LhQmi
GfRRJDDBx+flhj68uPdkJw4P60VSsgufaREjuB36TsfleIhDBEH7UC8GYigBQq2d
2Exl54naXKXyBwUfhAR/UmaZNhtElrrJCN584KHZdtd1X0MApxp1Cti6fXS6Ro5V
B9p9raA5OL60LNOR9BoBF+9ZEPhRDPLoLig6aa08aQKBgQDY2Hx9J9vlNbp/WwQK
LNsSjpyY7XQjY2dpjW/dpC7UXDwouALv0WIDI+GFt+n7tgvv57ZPWtyqh/gQ/0zg
55T1lvxA+pLWkLKODzTVMs1kOjDami9/35fhx4FXNI3gjoDMBbJOn/ReG55tcima
lrtSkGlfac7d8mTowny/PsG2RwKBgQC1KDS47ZZmeTyGYmY86iBEibWET+laHbnf
ATkWN7tQKJJsEnbJy8os60w7lvQhu1c8bxCFnZ5IS4NN/oXEvasL0MwHrCjExHha
MNbqxX6YxWNkhhifBAeteRWCF/Q3I8JBzAz48fHqhVlm097/s+b6x4ts7NlO0Hon
qvBwxTTW5QKBgAzrsVc/xcF9lxQ5lx8IFzGe38PY+j+Vj7bhX5YET2oF6OvAMySZ
BE8Nl0WBdOazrThpRRqrXlSm72gL3kfUZLLRgUxZ4d/5FTqTu2EsusJLGVgdMdFb
wFAKtDE/B2km9JOzjzFSJJxq5uC8mbAFZToBMtYlltbwt4SK+iXnFmHHAoGANXfD
b9136ZDY41UBlfMISRJYB9BKMHXbmU1UGxGh8Hu5E7qzYsYKSw27t07LiXUwvz6M
otMtl2rqO0fnFXVhmaAryAvxEHpohz4pAKv/vHlt54qIk85tsa6uQXJueyPLvv3J
ymQmobBv/aCFDfV8NAJXTXPug4uWskSKqM4b1V0CgYBMX4LbCu8d6L9qNjQibikD
R30mY+09FrLBD3l+WRhixbMUkLvGWI4etMaWxtM5UC4lT+K+fAxxDaVaVmgHo7xJ
AgEqmkE7xGwpV0TsNu04q/dxOqp3DNHwTwS+dwlJhqKW9Wqa6oldZx+h8MwwRq6M
JMlYgImMW/pZB3eAoHk9rg==
-----END PRIVATE KEY-----`;

@Injectable({
  providedIn: 'root'
})
export class QzTrayService {
  private isConnecting = false;
  private isSecurityConfigured = false;

  constructor() {
    this.setupSecurity();
  }

  /**
   * Set up digital certificate and signature algorithm
   * so QZ Tray permanently allows silent printing without showing prompts
   */
  private setupSecurity(): void {
    if (this.isSecurityConfigured) return;

    try {
      // 1. Tell QZ Tray our trusted certificate
      qz.security.setCertificatePromise((resolve: (cert: string) => void) => {
        resolve(QZ_CERTIFICATE);
      });

      // 2. Set SHA512 signing algorithm
      qz.security.setSignatureAlgorithm('SHA512');

      // 3. Cryptographically sign each request with our private key
      qz.security.setSignaturePromise((toSign: string) => {
        return (resolve: (sig: string) => void, reject: (err: any) => void) => {
          try {
            const pk = KEYUTIL.getKey(QZ_PRIVATE_KEY);
            const sig = new KJUR.crypto.Signature({ alg: 'SHA512withRSA' });
            sig.init(pk);
            sig.updateString(toSign);
            const hex = sig.sign();
            const signatureBase64 = stob64(hextorstr(hex));
            resolve(signatureBase64);
          } catch (err) {
            console.error('Failed to sign QZ request:', err);
            reject(err);
          }
        };
      });

      this.isSecurityConfigured = true;
      console.log('QZ Tray digital signature security successfully configured.');
    } catch (e) {
      console.warn('Could not configure QZ Tray security:', e);
    }
  }

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
    this.setupSecurity();

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
    const saved = localStorage.getItem('qz_selected_printer');
    if (saved && saved.trim() !== '') {
      return saved;
    }

    try {
      const def = await this.getDefaultPrinter();
      if (def && typeof def === 'string' && def.trim() !== '') {
        return def;
      }
    } catch (err) {
      console.warn('Could not query default printer:', err);
    }

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

    const targetPrinter = options?.printerName || (await this.getPreferredPrinter());
    if (!targetPrinter) {
      throw new Error('No printer found. Please select or install a printer in Windows.');
    }

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

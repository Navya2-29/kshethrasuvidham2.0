import { Injectable, inject } from '@angular/core';
// import { MasterService } from '../master/master.service';
import { Pmaster } from '../../models/pmaster.model';
import { Vmaster } from '../../models/vmaster.model';

@Injectable({
  providedIn: 'root'
})
export class DuplicatecheckService {


  // private masterService=inject(MasterService)
  constructor() { }

  checkDuplicateCode(code: string, pmasterData: Pmaster[]): boolean {
    return pmasterData.some(p => p.PM_Code == code);
  }

  checkDuplicateName(name: string, pmasterData: Pmaster[]): boolean {
    return pmasterData.some(p => p.PM_NameEng === name);
  }

  vmastercheckDuplicateCode(code: string, vmasterData: Vmaster[]): boolean {
    return vmasterData.some(v => v.VM_Code == code);
  }

  vmastercheckDuplicateName(name: string, vmasterData: Vmaster[]): boolean {
    return vmasterData.some(v => v.VM_Name === name);
  }
}

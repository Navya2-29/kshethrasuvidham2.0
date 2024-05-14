import { Injectable, inject } from '@angular/core';
// import { MasterService } from '../master/master.service';
import { Pmaster } from '../../models/pmaster.model';

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

  vmastercheckDuplicateCode(code: string, vmasterData: Pmaster[]): boolean {
    return vmasterData.some(v => v.PM_Code == code);
  }

  vmastercheckDuplicateName(name: string, vmasterData: Pmaster[]): boolean {
    return vmasterData.some(v => v.PM_NameEng === name);
  }
}

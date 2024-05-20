import { Injectable, inject } from '@angular/core';
// import { MasterService } from '../master/master.service';
import { Pmaster } from '../../models/pmaster.model';
import { Vmaster } from '../../models/vmaster.model';
import { Cmaster } from '../../models/cmaster.model';
import { ItemMaster } from '../../models/item-master.model';

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

  cmastercheckDuplicateCode(code: string, cmasterData: Cmaster[]): boolean {
    return cmasterData.some(c => c.CM_Code == code);
  }

  cmastercheckDuplicateName(name: string, cmasterData: Cmaster[]): boolean {
    return cmasterData.some(c => c.CM_NameEng === name);
  }

  itemMastercheckDuplicateCode(code: string, ImasterData: ItemMaster[]): boolean {
    return ImasterData.some(I => I.item_code == code);
  }

  itemMastercheckDuplicateName(name: string, ImasterData: ItemMaster[]): boolean {
    return ImasterData.some(I => I.item_code === name);
  }

}

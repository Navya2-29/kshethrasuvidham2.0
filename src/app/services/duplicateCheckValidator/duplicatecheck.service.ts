import { Injectable, inject } from '@angular/core';
// import { MasterService } from '../master/master.service';
import { Pmaster } from '../../models/pmaster.model';
import { Vmaster } from '../../models/vmaster.model';
import { Cmaster } from '../../models/cmaster.model';
import { ItemMaster } from '../../models/item-master.model';
import { VihidhamMaster } from '../../models/vihidham-master.model';
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
    return pmasterData.some(p => p.PM_Name === name);
  }
  vmastercheckDuplicateCode(code: string, vmasterData: Vmaster[]): boolean {
    return vmasterData.some(v => v.VM_Code == code);
  }

  vmastercheckDuplicateName(name: string, vmasterData: Vmaster[]): boolean {
    return vmasterData.some(v => v.VM_Name === name);
  }
  cmastercheckDuplicateCode(code: string, cmasterData: Cmaster[]): boolean {
    return cmasterData.some(c => c.VC_Code == code);
  }
  cmastercheckDuplicateName(name: string, cmasterData: Cmaster[]): boolean {
    return cmasterData.some(c => c.VC_Name === name);
  }
  itemMastercheckDuplicateCode(code: string, ImasterData: ItemMaster[]): boolean {
    return ImasterData.some(I => I.item_code == code);
  }

  itemMastercheckDuplicateName(name: string, ImasterData: ItemMaster[]): boolean {
    return ImasterData.some(I => I.item_code === name);
  }
  vihidhamMastercheckDuplicateCode(code: string, vihidhamData: VihidhamMaster[]): boolean {
    return vihidhamData.some(v => v.vihidham_code == code);
  }

  vihidhamMastercheckDuplicateName(name: string, vihidhamData: VihidhamMaster[]): boolean {
    return vihidhamData.some(v => v.vihidham_name === name);
  }

  getPmasterByCode(abc:any){
    const reqbody={"Type":"Category","Code":"12"}
  }
}

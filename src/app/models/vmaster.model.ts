export interface Vmaster{
ACHeadCode:string;
ACSubCode:string;
DisplayMode:string;
SMS:string;
VC_ID:number;
VM_Active:string;
VM_AlertMsg:string;
VM_Amt:number;
VM_Blocking:string;
VM_Booking:string;
VM_Code:string;
VM_Description:string;
VM_Device:string;
VM_Id:number;
VM_MaxNo:number;
VM_Mobileapp:string;
VM_MultiName:string;
VM_Name:string;
VM_RName:string;
VM_Rate_Change:string;
VM_Receipt:string;
VM_Seasonal:string;
VM_Special:string;
VM_Time:string;
VM_TimeLimit:number
Whatsapp:string

}
export  interface AccountHead{
	id:number;
	name:string;
}
export interface AccountSubHead{
	id:number;
	name:string;
}
export interface VcList{
	VC_Id:string,
	VC_Name:string;
}
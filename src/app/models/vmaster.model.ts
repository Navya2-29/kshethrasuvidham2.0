export interface Vmaster{
	VM_Id:number,
	VM_Code:String;
	VM_Name:String;
	VM_RName:String;
	VM_Amt:number;
	VM_MaxNo:number;
	VM_Receipt:String;
	VM_Booking :String;
	VM_Blocking:String;
	VM_SeaSonal:String;
	VM_MultiName:String;
	VM_Device:String;
	VM_Mobileapp:String;
	VM_Special:String;
	VM_Rate_Change:String;
	VM_Time :String;
	VM_TimeLimit:number;
	VM_DeScription:String;
	VM_AlertMSg:String;
	VC_ID:String;
	VM_Active:String;
	DiSplayMode:String;
	ACHeadCode:String;
	ACSubCode:String;
	VP_Name:string;
	id:number;
	VM_Online:string;
	VM_Sms:string;
	VM_Watsapp:string;
	VC_Name:string;
}
export  interface AccountHead{
	id:number;
	name:string;
}
export interface AccountSubHead{
	id:number;
	name:string;
}
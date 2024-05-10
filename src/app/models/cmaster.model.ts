export interface Pmaster {
    CM_Code: string;
    CM_Name: string;
    CM_NameEng: string;
    imgurl: string;
    id:string;
    version: number;
    updation: number;
  }

  export interface CreatePmaster{
    CM_Code:string,
    CM_NameEng:string,
    CM_Name:string,
    imgurl?:string
  }
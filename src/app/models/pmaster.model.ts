export interface Pmaster {
    PM_Code: string;
    PM_Name: string;
    PM_NameEng: string;
    imgurl: string;
    id:string;
    version: number;
    updation: number;
  }

  export interface CreatePmaster{
    PM_Code:string,
    PM_NameEng:string,
    PM_Name:string,
    imgurl?:string
  }
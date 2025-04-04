import { NgPluralCase } from '@angular/common';
export const Constant = {
  BASE_URL: 'http://api.suvidham.in/api/KshetramAPI/',
  // BASE_URL:'https://api.lacsindore.in/api/KshetramAPI/',

  // BASE_URL: 'https://panchiyammaapi.suvidham.in/api/KshetramAPI/',
  // BASE_URL: 'https://api.rgstrusttvm.in/api/KshetramAPI/',
  // BASE_URL:'https://api.oolamparaganapthy.in/api/KshetramAPI/',
  METHODS: {
    // master view
    GET_MASTER: 'ViewMasters',
    // delete masters
    DELETE_MASTER: 'DeleteMasters',
    // pmaster
    CREATE_PMASTER: 'AddPrathista',
    // cmaster
    CREATE_CMASTER: 'AddVazhipadCategory',
    Type: 'Category',
    // vmaster
    CREATE_VMASTER: 'AddVazhipadMaster',
    // daymaster
    CREATE_VDAY: 'DayMaster',
    // SPECIAL master
    GET_VSPECIAL: 'specialDay',
    GET_ALL_SPECIAL: 'getall',
    CREATE_VSPECIAL: 'create',
    UPDATE_VSPECIAL: 'update',
    DELETE_VSPECIAL: 'delete',
    // seasonal master
    CREATE_SEASONAL: 'VazhipadSeasonal',
    // vihidhm master
    GET_ALL_VIHIDHAM: 'getall',
    CREATE_VIHIDHAM: 'create',
    UPDATE_VIHIDHAM: 'update',
    DELETE_VIHIDHAM: 'delete',

    // BLOcking master

    CREATE_VBLOCK: 'VazhipadBlocking',

    // COMBO MASTWR
    GET_VCOMBO: 'comboVazhipad',
    GET_VCOMBO_BYID: 'vcombo',
    GET_ALL_VCOMBO: 'getall',
    CREATE_VCOMBO: 'create',
    UPDATE_VCOMBO: 'update',
    DELETE_VCOMBO: 'delete',

    // ITEM MASTER
    GET_ITEM: 'Nad',
    GET_ALL_ITEM: '',
    CREATE_ITEM: 'AddNAdavaravuMaster',
    UPDATE_ITEM: 'update',
    DELETE_ITEM: 'delete',

    // member master

    GET_ALL_MEMBER: 'getall',
    CREATE_MEMBER: 'create',
    UPDATE_MEMBER: 'update',
    DELETE_MEMBER: 'delete',

    // login
    LOGIN: 'GetLoginInfo',

    // commen
    GET_ACCOUNTHEAD: 'getAccountHead',
    GET_SUBACCOUNTHEAD: 'getAccountSubHead',

    // vazhipad booking
    VAZHIPAD_BOOKING: 'VazhipadBooking',
    SEARCHBYMOBILENUMBER: 'ViewMasters',
    STARDATA: 'ListStar',
    MULTIDAY_FILTER: 'MultiFilter',
    GET_REPORT: 'GetReport',
    CANCEL_BILL: 'CancelBill',
    NADAVARAV_BOOKING: 'NadavaravuBooking',
    CREATE_STAFF: 'AddStaffMaster',
  CREDITCOLLECT:"CreditCollect",
  UPDATEBILL:"UpdateBill",
  DUPLICATECOUNT:"DuplicateCount",
  ADDCOUNTER:"ADDCounter",
  UPDATESETTING:"UpdateSetting",
  VAZHIPADWISEREPRT:"VazhipadWiseReport",
  UPDATEBILLMODE:"UpdateBillMode",
  CHECKMULTIBLOCKS:"CheckMultiBlocks",
  DAY:"Day",
  DEVOTEEMASTER:"DevoteeMaster",
  FEECOLLECTION:"FeeCollection",
  CHANGEPASSWORD:"ChangePassword"
  },

};

import { any } from "bluebird";

export type DodaiQuery = {
  query?: string;
};

export type DodaiResponseType = {
  status: number;
  body: any;
};

export type DatastorePageType = {
  datastore: string;
  page: number;
};

export type DodaiRequestHeader = {
  authorization: string;
  "content-type": string;
};

export type Block = any;

export type TripletBlocks = {
  trigger: Block;
  service: Block;
  action: Block;
};

export type PageInfoList = {
  appletstorestatus: DatastorePageType;
  appletpublicstatus: DatastorePageType;
  appletgoodnum: DatastorePageType;
  appletmisc: DatastorePageType;
};

export type DownalodNumType = {
  _id: string;
  data: {
    appletId: string;
    dlcnt: number;
  };
};

export type AppletInfoType = {
  id: string;
  ownerId: string;
  likeNum: number;
  downloadNum: number;
  publicStatus: boolean;
  storeStatus: string;
  submitDate: string;
  release?: string;
};

export type AppletWholeInfoType = {
  id: string;
  applet: AppletType;
  appletInfo: AppletInfoType;
};

export type AppletType = any;
export type LikeNumType = {
  _id: string;
  data: {
    num: number;
  };
};

export type AppletPublicStatusType = {
  _id: string;
  data: {
    status: boolean;
  };
};

export type AppletStoreStatusDataType = {
  status: string;
  message?: string;
  release?: string;
};

export type AppletStoreStatusType = {
  _id: string;
  data: AppletStoreStatusDataType;
};

export type DodaiEntityType = {
  _id: string;
  data: any;
};

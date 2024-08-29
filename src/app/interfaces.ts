
export interface IPaginationQuery {
  $rpp?: number;
  $page?: number;
  $orderBy?: Object;
  $filter?: Object;
}
export interface IAuthorizationHeaderSchema {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  openIdConnectUrl?: string;
}
export interface IForecastQuery {
  $userId: string;
  $timeStamp: string;
}
export interface IPageinatedDataTable {
  pages: string;
  total: number;
  data: Object[];
}
export interface IImage {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

import { IHeaders } from './IHeaders';

export interface IRequestDetails {
  url: string;
  method: string;
  headers: IHeaders;
  body: FormData | string | null;
  cachingKey: string;
}

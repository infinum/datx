import type { IError, IJsonApiObject, ILink, IMeta, IRecord } from '@datx/jsonapi-types';

export interface IResponse {
  data?: IRecord | Array<IRecord>;
  errors?: Array<IError>;

  included?: Array<IRecord>;

  meta?: IMeta;
  links?: Record<string, ILink>;
  jsonapi?: IJsonApiObject;
}

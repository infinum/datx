import {IDictionary} from 'datx-utils';

interface IDefinition {
  id?: number|string;
  type: string;
}

interface IJsonApiObject {
  version?: string;
  meta?: IDictionary<any>;
}

type ILink = string | {href: string, meta: IDictionary<any>};

interface IError {
  id?: string|number;
  links?: {
    about: ILink,
  };
  status?: number;
  code?: string;
  title?: string;
  details?: string;
  source?: {
    pointer?: string,
    parameter?: string,
  };
  meta?: IDictionary<any>;
}

interface IRelationship {
  data?: IDefinition|Array<IDefinition>;
  links?: IDictionary<ILink>;
  meta?: IDictionary<any>;
}

interface IRecord extends IDefinition {
  attributes: IDictionary<any>;

  relationships?: IDictionary<IRelationship>;
  links?: IDictionary<ILink>;
  meta?: IDictionary<any>;
}

interface IResponse {
  data?: IRecord|Array<IRecord>;
  errors?: Array<IError>;

  included?: Array<IRecord>;

  meta?: IDictionary<any>;
  links?: IDictionary<ILink>;
  jsonapi?: IJsonApiObject;
}

type IRequest = IResponse; // Not sure if this is correct, but it's ok for now

export {
  IDefinition,
  IJsonApiObject,
  ILink,
  IError,
  IRelationship,
  IRecord,
  IResponse,
  IRequest,
};

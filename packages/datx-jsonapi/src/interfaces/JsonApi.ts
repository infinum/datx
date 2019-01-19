import { IDictionary } from 'datx-utils';

interface IDefinition {
  id?: number | string;
  type: string;
}

interface IJsonApiObject {
  version?: string;
  meta?: IDictionary;
}

type ILink = string | { href: string; meta: IDictionary };

interface IError {
  id?: string | number;
  links?: {
    about: ILink;
  };
  status?: number;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  meta?: IDictionary;
}

interface IRelationship {
  data?: IDefinition | Array<IDefinition> | null;
  links?: IDictionary<ILink>;
  meta?: IDictionary;
}

interface IRecord extends IDefinition {
  attributes?: IDictionary;

  relationships?: IDictionary<IRelationship>;
  links?: IDictionary<ILink>;
  meta?: IDictionary;
}

interface IResponse {
  data?: IRecord | Array<IRecord>;
  errors?: Array<IError>;

  included?: Array<IRecord>;

  meta?: IDictionary;
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

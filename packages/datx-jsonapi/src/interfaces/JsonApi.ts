interface IDefinition {
  id?: string;
  type: string;
}

interface IJsonApiObject {
  version?: string;
  meta?: Record<string, any>;
}

type ILink = string | { href: string; meta: Record<string, any> };

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
  meta?: Record<string, any>;
}

interface IRelationship {
  data?: IDefinition | Array<IDefinition> | null;
  links?: Record<string, ILink>;
  meta?: Record<string, any>;
}

interface IRecord extends IDefinition {
  attributes?: Record<string, any>;

  relationships?: Record<string, IRelationship>;
  links?: Record<string, ILink>;
  meta?: Record<string, any>;
}

interface IResponse {
  data?: IRecord | Array<IRecord>;
  errors?: Array<IError>;

  included?: Array<IRecord>;

  meta?: Record<string, any>;
  links?: Record<string, ILink>;
  jsonapi?: IJsonApiObject;
}

type IRequest = IResponse; // Not sure if this is correct, but it's ok for now

// eslint-disable-next-line no-undef
export { IDefinition, IJsonApiObject, ILink, IError, IRelationship, IRecord, IResponse, IRequest };

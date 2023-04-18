export interface IDefinition {
  id?: string;
  type: string;
}

export type IMeta = Record<string, any>;

export interface IJsonApiObject {
  version?: string;
  meta?: IMeta;
}

/**
 * @docs https://jsonapi.org/format/#auto-id--link-objects
 * @version json:api v1.1
 */
export interface ILinkObject<TMeta extends IMeta = IMeta> {
  /**
   * a string whose value is a URI-reference [RFC3986 Section 4.1](https://datatracker.ietf.org/doc/html/rfc3986#section-4.1) pointing to the link’s target.
   */
  href: string;
  /**
   * a string indicating the link’s relation type. The string MUST be a [valid link relation type](https://datatracker.ietf.org/doc/html/rfc8288#section-2.1).
   */
  rel?: string;
  /**
   * a [link](https://jsonapi.org/format/#document-links-link) to a description document (e.g. OpenAPI or JSON Schema) for the link target.
   */
  describedby?: string;
  /**
   * a string which serves as a label for the destination of a link such that it can be used as a human-readable identifier (e.g., a menu entry).
   */
  title?: string;
  /**
   * a string indicating the media type of the link’s target.
   */
  type?: string;
  /**
   * a string or an array of strings indicating the language(s) of the link’s target. An array of strings indicates that the link’s target is available in multiple languages. Each string MUST be a valid language tag [RFC5646](https://datatracker.ietf.org/doc/html/rfc5646).
   */
  hreflang?: string;
  /**
   * a meta object containing non-standard meta-information about the link.
   */
  meta?: TMeta;
}

export type ILink = string | ILinkObject;

export interface IError {
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
  meta?: IMeta;
}

export interface IRelationship {
  data?: IDefinition | Array<IDefinition> | null;
  links?: Record<string, ILink>;
  meta?: IMeta;
}

export interface IRecord extends IDefinition {
  attributes?: Record<string, any>;

  relationships?: Record<string, IRelationship>;
  links?: Record<string, ILink>;
  meta?: IMeta;
}

export interface IResponse {
  data?: IRecord | Array<IRecord>;
  errors?: Array<IError>;

  included?: Array<IRecord>;

  meta?: IMeta;
  links?: Record<string, ILink>;
  jsonapi?: IJsonApiObject;
}

export type IRequest = IResponse; // Not sure if this is correct, but it's ok for now

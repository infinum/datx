/**
 * @deprecated renamed to IResourceIdentifierObject
 */
export type IDefinition = IResourceIdentifierObject;

/**
 * An object that identifies an individual resource.
 *
 * @doc https://jsonapi.org/format/#document-resource-identifier-objects
 * @version json:api v1.1
 */
export interface IResourceIdentifierObject {
  id?: string;
  type: string;
  lid?: string;
  meta?: IMeta;
}

export type IMeta = Record<string, any>;

/**
 * A JSON:API document MAY include information about its implementation under a top level jsonapi member.
 * If present, the value of the jsonapi member MUST be an object (a “jsonapi object”).
 *
 * @docs https://jsonapi.org/format/#document-jsonapi-object
 * @version json:api v1.1
 * @example
 * ```json
 * {
 *  "jsonapi": {
 *    "version": "1.1",
 *    "ext": [
 *      "https://jsonapi.org/ext/atomic"
 *    ],
 *    "profile": [
 *      "http://example.com/profiles/flexible-pagination",
 *      "http://example.com/profiles/resource-versioning"
 *    ]
 *  }
 * }
 * ```
 */
export interface IJsonApiObject {
  version?: string;
  ext?: Array<string>;
  profile?: Array<string>;
  meta?: IMeta;
}

/**
 * @docs https://jsonapi.org/format/#auto-id--link-objects
 * @version json:api v1.1
 */
export interface ILinkObject<TMeta extends IMeta = IMeta> {
  /**
   * a string whose value is a URI-reference
   * [RFC3986 Section 4.1](https://datatracker.ietf.org/doc/html/rfc3986#section-4.1) pointing to the link’s target.
   */
  href: string;
  /**
   * a string indicating the link’s relation type. The string MUST be a
   * [valid link relation type](https://datatracker.ietf.org/doc/html/rfc8288#section-2.1).
   */
  rel?: string;
  /**
   * a [link](https://jsonapi.org/format/#document-links-link) to a description document
   * (e.g. OpenAPI or JSON Schema) for the link target.
   */
  describedby?: string;
  /**
   * a string which serves as a label for the destination of a link such that it can be used as a
   * human-readable identifier (e.g., a menu entry).
   */
  title?: string;
  /**
   * a string indicating the media type of the link’s target.
   */
  type?: string;
  /**
   * a string or an array of strings indicating the language(s) of the link’s target.
   * An array of strings indicates that the link’s target is available in multiple languages.
   * Each string MUST be a valid language tag [RFC5646](https://datatracker.ietf.org/doc/html/rfc5646).
   */
  hreflang?: string;
  /**
   * a meta object containing non-standard meta-information about the link.
   */
  meta?: TMeta;
}

/**
 * - a string whose value is a URI-reference
 * [RFC3986 Section 4.1](https://datatracker.ietf.org/doc/html/rfc3986#section-4.1) pointing to the link’s target,
 * - a [link object](https://jsonapi.org/format/#document-links-link-object) or
 * - null if the link does not exist.
 *
 * @docs https://jsonapi.org/format/#document-links-link
 */
export type ILink = string | ILinkObject | null;

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

/**
 * @deprecated renamed to IRelationshipObject
 */
export type IRelationship = IRelationshipObject;

/**
 * A relationships object describing relationships between the resource and other JSON API resources.
 *
 * @docs https://jsonapi.org/format/#document-resource-object-relationships
 * @version json:api v1.1
 * @example
 * ```json
 * // to-one relationship
 * {
 *   "data": {
 *    "type": "author",
 *    "id": "1"
 *   },
 *   "links": {
 *     "self": "/articles/1/relationships/author",
 *     "related": "/articles/1/author"
 *   },
 *   "meta": {
 *    "status": "active"
 *   }
 * }
 * ```
 * @example
 * ```json
 * // to-many relationship
 * {
 *  "data": [
 *    {
 *      "type": "author",
 *      "id": "1"
 *    },
 *    {
 *      "type": "author",
 *      "id": "2"
 *    }
 *  ],
 *  "links": {
 *    "self": "/articles/1/relationships/authors",
 *    "related": "/articles/1/authors"
 *  },
 *  "meta": {
 *    "count": 2
 *  }
 * }
 * ```
 */
export interface IRelationshipObject {
  data?: IResourceIdentifierObject | Array<IResourceIdentifierObject> | null;
  links?: Record<string, ILink>;
  meta?: IMeta;
}

/**
 * @deprecated renamed to IResourceObject
 */
export type IRecord = IResourceObject;

/**
 * @docs https://jsonapi.org/format/#document-resource-objects
 * @version json:api v1.1
 */
export interface IResourceObject extends IResourceIdentifierObject {
  /**
   * An attributes object representing some of the resource’s data.
   *
   * @docs https://jsonapi.org/format/#document-resource-object-attributes
   * @version json:api v1.1
   * @example
   * ```json
   * {
   *  "attributes": {
   *     "title": "Rails is Omakase",
   *     "body": "The Parley Letter",
   *   },
   * }
   * ```
   */
  attributes?: Record<string, any>;

  /**
   * A relationships object describing relationships between the resource and other JSON API resources.
   *
   * @docs https://jsonapi.org/format/#document-resource-object-relationships
   * @version json:api v1.1
   * @example
   * ```json
   * // to-one relationship
   * {
   *   "relationships": {
   *     "author": {
   *       "links": {
   *         "self": "/articles/1/relationships/author",
   *         "related": "/articles/1/author"
   *       },
   *       "data": { "type": "people", "id": "9" }
   *     }
   *   }
   * }
   * ```
   * @example
   * ```json
   * // to-many relationship
   * {
   *   "relationships": {
   *     "authors": {
   *       "links": {
   *         "self": "/articles/1/relationships/authors",
   *         "related": "/articles/1/authors"
   *       },
   *       "data": [
   *         { "type": "people", "id": "9" },
   *         { "type": "people", "id": "5" }
   *       ]
   *     }
   *   }
   * }
   * ```
   */
  relationships?: Record<string, IRelationship>;

  /**
   * A links object containing links related to the resource.
   *
   * @docs https://jsonapi.org/format/#document-resource-object-links
   *
   * @example
   * ```json
   * {
   *  "links": {
   *    "self": "http://example.com/articles/1"
   * }
   * ```
   * @version json:api v1.1
   * @see https://jsonapi.org/format/#document-links
   * @see https://jsonapi.org/format/#document-links-link-object
   * @see https://jsonapi.org/format/#document-links-link
   */
  links?: Record<string, ILink>;

  /**
   * A meta object containing non-standard meta-information about a resource that can not be represented
   * as an attribute or relationship.
   * @docs https://jsonapi.org/format/#document-meta
   * @version json:api v1.1
   * @example
   * ```json
   * {
   *   "meta": {
   *     "rating": 5
   *   }
   * }
   * ```
   */
  meta?: IMeta;
}

/**
 * @deprecated renamed to IDocument
 */
export type IResponse = IDocument;

/**
 * A top level object in a JSON API document.
 *
 * @docs https://jsonapi.org/format/#document-top-level
 */
export interface IDocument {
  data?: IResourceObject | Array<IResourceObject>;
  errors?: Array<IError>;

  included?: Array<IRecord>;

  meta?: IMeta;
  links?: Record<string, ILink>;
  jsonapi?: IJsonApiObject;
}

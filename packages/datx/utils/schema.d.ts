import { IPlainResource, IResource } from '../interfaces/IResource';
import { IValidationError } from '../interfaces/IValidationError';
import { IValidationOptions } from '../interfaces/IValidationOptions';
import { Schema } from '../Schema';
export declare function parseSchema<TSchema extends Schema>(schema: TSchema, data: IPlainResource<TSchema>): IResource<TSchema>;
export declare function serializeSchema<TSchema extends Schema>(schema: TSchema, data: IResource<TSchema>): IPlainResource<TSchema>;
export declare function validateSchema<TSchema extends Schema>(schema: TSchema, data: IResource<TSchema>, options?: IValidationOptions, path?: string): [boolean, Array<IValidationError>];

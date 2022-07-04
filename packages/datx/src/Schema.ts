import { parseSchema, serializeSchema } from './utils/schema';
import { ISchemaData } from './interfaces/ISchemaData';
import { IPlainResource, IResource } from './interfaces/IResource';

export class Schema<T extends ISchemaData = ISchemaData> {
  constructor(public readonly type: string | number, public readonly definition: T) {}

  parse(data: IPlainResource<this>): IResource<this> {
    return parseSchema(this, data);
  }

  serialize(data: IResource<this>): IPlainResource<this> {
    return serializeSchema(this, data);
  }
}

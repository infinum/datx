import { parseSchema } from './utils/schema/parse';
import { serializeSchema } from './utils/schema/serialize';
import { ISchemaData } from './interfaces/ISchemaData';
import { IPlainResource, IResource } from './interfaces/IResource';

export class Schema<T extends ISchemaData = ISchemaData> {
  constructor(
    public readonly type: string | number,
    public readonly definition: T,
    public readonly id: (data: IResource<Schema>) => string | number,
  ) {}

  public parse(data: IPlainResource<this>): IResource<this> {
    return parseSchema(this, data);
  }

  public serialize(data: IResource<this>): IPlainResource<this> {
    return serializeSchema(this, data);
  }
}

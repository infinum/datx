import { parseSchema } from './utils/schema/parse';
import { serializeSchema } from './utils/schema/serialize';
import { ISchemaData } from './interfaces/ISchemaData';
import { IPlainResource, IResource } from './interfaces/IResource';
import { IFlattenedResource } from './interfaces/IFlattenedResource';

export class Schema<T extends ISchemaData = ISchemaData> {
  constructor(
    public readonly type: string | number,
    public readonly definition: T,
    public readonly id: (data: IResource<Schema>) => string | number,
  ) {}

  public parse(data: IPlainResource<this>): IResource<this> {
    return parseSchema(this, data);
  }

  public serialize(
    data: IResource<this>,
    depth?: number,
    flatten?: false,
    contained?: Array<string | number>,
  ): IPlainResource<this>;
  public serialize(
    data: IResource<this>,
    depth: number,
    flatten: true,
    contained?: Array<string | number>,
  ): IFlattenedResource<this>;
  public serialize(
    data: IResource<this>,
    depth?: number,
    flatten?: boolean,
    contained?: Array<string | number>,
  ): IPlainResource<this> | IFlattenedResource<this>;
  public serialize(
    data: IResource<this>,
    depth?: number,
    flatten?: boolean,
    contained?: Array<string | number>,
  ): IPlainResource<this> | IFlattenedResource<this> {
    return serializeSchema(this, data, depth, flatten, contained);
  }
}

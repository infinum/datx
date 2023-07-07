import { parseSchema } from './utils/schema/parse';
import { serializeSchema } from './utils/schema/serialize';
import { ISchemaData } from './interfaces/ISchemaData';
import { IPlainResource, IResource } from './interfaces/IResource';
import { IFlattenedResource } from './interfaces/IFlattenedResource';
import { IOuterType } from './interfaces/IOuterType';
import { type } from './type';
import { IInnerType } from './interfaces/IInnerType';

export class Schema<T extends ISchemaData = ISchemaData> implements IOuterType<any> {
  public readonly type: IInnerType<this>;
  constructor(
    public readonly _type: string | number,
    public readonly definition: T,
    public readonly id: (data: IResource<Schema>) => string | number,
  ) {
    this.type = {
      type: this,
    };
  }

  public parse(data: IPlainResource<this>): IResource<this>;
  public parse(data: Array<IPlainResource<this>>): Array<IResource<this>>;
  public parse(
    data: IPlainResource<this> | Array<IPlainResource<this>>,
  ): IResource<this> | Array<IResource<this>> {
    return parseSchema(this, data as IPlainResource<this>);
  }

  public serialize(
    data: IResource<this>,
    depth?: number,
    flatten?: false,
    contained?: Array<string | number>,
  ): IPlainResource<this>;
  public serialize(
    data: Array<IResource<this>>,
    depth?: number,
    flatten?: false,
    contained?: Array<string | number>,
  ): Array<IPlainResource<this>>;
  public serialize(
    data: IResource<this>,
    depth: number,
    flatten: true,
    contained?: Array<string | number>,
  ): IFlattenedResource<this>;
  public serialize(
    data: Array<IResource<this>>,
    depth: number,
    flatten: true,
    contained?: Array<string | number>,
  ): IFlattenedResource<this, true>;
  public serialize(
    data: IResource<this> | Array<IResource<this>>,
    depth?: number,
    flatten?: boolean,
    contained?: Array<string | number>,
  ):
    | IPlainResource<this>
    | IFlattenedResource<this>
    | Array<IPlainResource<this>>
    | IFlattenedResource<this, true>;
  public serialize(
    data: IResource<this> | Array<IResource<this>>,
    depth?: number,
    flatten?: boolean,
    contained?: Array<string | number>,
  ):
    | IPlainResource<this>
    | IFlattenedResource<this>
    | Array<IPlainResource<this>>
    | IFlattenedResource<this, true> {
    return serializeSchema(this, data as IResource<this>, depth, flatten, contained);
  }

  public optional(defaultValue?: ThisType<T>) {
    return type(this, true, defaultValue);
  }
}

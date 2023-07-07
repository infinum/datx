import { PartialOnUndefinedDeep, Simplify } from 'type-fest';
import { IResource } from '../../interfaces/IResource';
import { ISchemaDefinition } from '../../interfaces/ISchemaDefinition';
import { ISchemaInstance } from '../../interfaces/ISchemaInstance';
import { ISchemaPlain } from '../../interfaces/ISchemaPlain';
import { parseSchema } from '../schema/parse';
import { serializeSchema } from '../schema/serialize';

export class Schema<TDefinition extends ISchemaDefinition>
  implements IResource<ISchemaInstance<TDefinition>, ISchemaPlain<TDefinition>>
{
  constructor(
    public readonly definition: TDefinition,
    public readonly type: string,
    public readonly getId: (item: ISchemaInstance<TDefinition>) => string = (item) =>
      `${type}/${item.id}`,
    public readonly isOptional = false,
    public readonly defaultValue?: ISchemaInstance<TDefinition>,
  ) {}

  public serialize(instance: ISchemaInstance<TDefinition>): Simplify<ISchemaPlain<TDefinition>> {
    return serializeSchema(this, instance);
  }

  public parse(
    plain: PartialOnUndefinedDeep<ISchemaPlain<TDefinition>>,
  ): Simplify<ISchemaInstance<TDefinition>> {
    return parseSchema(this, plain);
  }

  public optional(): IResource<
    ISchemaInstance<TDefinition> | undefined,
    ISchemaPlain<TDefinition> | undefined
  > {
    return new Schema(this.definition, this.type, this.getId, true, this.defaultValue);
  }

  public default(
    value: ISchemaInstance<TDefinition>,
  ): IResource<ISchemaInstance<TDefinition>, ISchemaPlain<TDefinition>> {
    return new Schema(this.definition, this.type, this.getId, this.isOptional, value);
  }

  public test(item: unknown): item is ISchemaInstance<TDefinition> {
    return true; // TODO: Improve
  }
}

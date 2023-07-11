import { PartialOnUndefinedDeep, Simplify } from 'type-fest';
import { IResource } from '../../interfaces/IResource';
import { ISchemaDefinition } from '../../interfaces/ISchemaDefinition';
import { ISchemaInstance } from '../../interfaces/ISchemaInstance';
import { ISchemaPlain } from '../../interfaces/ISchemaPlain';
import { parseSchema } from '../schema/parse';
import { serializeSchema } from '../schema/serialize';
import { validatePlainSchema, validateSchemaInstance } from '../schema/validate';

export class Schema<TDefinition extends ISchemaDefinition> {
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

  public testInstance(
    item: PartialOnUndefinedDeep<ISchemaInstance<TDefinition>>,
  ): item is PartialOnUndefinedDeep<ISchemaInstance<TDefinition>> {
    if (typeof item !== 'object' || item === null) {
      return false;
    }

    return validateSchemaInstance(this, item)[0];
  }

  public testPlain(
    item: PartialOnUndefinedDeep<ISchemaPlain<TDefinition>>,
  ): item is PartialOnUndefinedDeep<ISchemaPlain<TDefinition>> {
    if (typeof item !== 'object' || item === null) {
      return false;
    }

    return validatePlainSchema(this, item)[0];
  }
}

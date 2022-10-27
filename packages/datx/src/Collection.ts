import { IResource } from './interfaces/IResource';
import { parseSchema } from './utils/schema/parse';
import { Schema } from './Schema';
import { SchemaMeta } from './SchemaMeta';

export class Collection {
  private readonly types: Array<Schema> = [];
  private readonly data: Array<IResource<Schema>> = [];
  public readonly byType: Record<string, Array<IResource<Schema>>> = {};
  public readonly byId: Record<string, IResource<Schema>> = {};

  public add<TSchema extends Schema>(data: IResource<TSchema>): IResource<TSchema>;
  public add<TSchema extends Schema>(
    data: IResource<TSchema, true>,
    type: TSchema,
  ): IResource<TSchema>;
  public add<TSchema extends Schema>(
    data: IResource<TSchema> | IResource<TSchema, true>,
    type?: TSchema,
  ): IResource<TSchema> {
    const item = type
      ? parseSchema(type, data as IResource<TSchema, true>)
      : (data as IResource<TSchema>);

    if (this.data.includes(item)) {
      return item;
    }

    const meta = SchemaMeta.get(item);
    if (type && !this.types.includes(type)) {
      this.types.push(type);
    } else if (meta?.schema && !this.types.includes(meta?.schema)) {
      this.types.push(meta?.schema);
    }

    this.data.push(item);

    if (meta) {
      meta.collection = this;
      this.byId[meta.id] = item;

      this.byType[meta.type] = this.byType[meta.type] || [];
      this.byType[meta.type].push(item);

      return item as IResource<TSchema>;
    }

    throw new Error('SchemaMeta not found');
  }
}

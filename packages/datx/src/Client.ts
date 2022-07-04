// import { IResource } from './interfaces/IResource';
// import { ISchemaData } from './interfaces/ISchemaData';
// import { Schema } from './Schema';

// class QueryBuilder<TSchema extends Schema<TData>, TData extends ISchemaData> {
//   constructor(public readonly type: TSchema) {}

//   getWhere(_query: any): Array<IResource<TSchema>> {
//     return [];
//   }

//   get(_id: string | number): IResource<TSchema> | null {
//     return null;
//   }
// }

// export class Client {
//   for<TSchema extends Schema<TData>, TData extends ISchemaData>(schema: TSchema) {
//     return new QueryBuilder(schema);
//   }
// }

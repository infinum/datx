import { Collection } from '../Collection';
import { Schema } from '../Schema';

export interface ISchemaMeta {
  id: string | number;
  type: string | number;
  schema: Schema;
  collection?: Collection;
}

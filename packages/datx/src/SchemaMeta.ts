import { IResource } from './interfaces/IResource';
import { ISchemaMeta } from './interfaces/ISchemaMeta';
import { Schema } from './Schema';

export const SchemaMeta = new WeakMap<IResource<Schema>, ISchemaMeta>();

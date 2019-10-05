import { ToMany, ToOne, ToOneOrMany } from '../buckets';
import { PureModel } from '../PureModel';

export type IBucket<T extends PureModel> = ToMany<T> | ToOne<T> | ToOneOrMany<T>;

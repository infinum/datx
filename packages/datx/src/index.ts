export { IRawModel } from 'datx-utils';

import { ToMany, ToOne, ToOneOrMany } from './buckets';
// tslint:disable-next-line:export-name
export const Bucket = { ToMany, ToOne, ToOneOrMany };

export { Attribute } from './Attribute';
export { Collection } from './Collection';
export { Model } from './Model';
export { PureCollection } from './PureCollection';
export { PureModel } from './PureModel';
export { View } from './View';

export { ReferenceType } from './enums/ReferenceType';

export { getModelType } from './helpers/model/utils';

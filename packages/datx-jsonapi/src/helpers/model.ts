import {META_FIELD} from 'datx/dist/consts';
import {mapItems} from 'datx/dist/helpers/utils';
import {IRawModel} from 'datx/dist/interfaces/IRawModel';

import {IDictionary} from '../interfaces/IDictionary';
import {IDefinition, IRecord, IRelationship} from '../interfaces/JsonApi';

export function flattenModel(): null;
export function flattenModel(data?: IRecord): IRawModel;
export function flattenModel(data?: IRecord): IRawModel|null {
  if (!data) {
    return null;
  }

  const rawData = {
    [META_FIELD]: {
      id: data.id,
      jsonapiLinks: data.links,
      jsonapiMeta: data.meta,
      jsonapiPersisted: Boolean(data.id),
      type: data.type,
    },
  };

  if (data.relationships) {
    Object.keys(data.relationships).forEach((key) => {
      const ref = (data.relationships as IDictionary<IRelationship>)[key] as IRelationship;
      rawData[key] = mapItems(ref.data, (item: IDefinition) => item.id);
    });
  }

  return Object.assign(rawData, data.attributes);
}

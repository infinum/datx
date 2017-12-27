import {IProp} from './interfaces/IProp';
import {Model} from './Model';
import {storage} from './services/storage';

function prop<T extends Model>(obj: T, key: string) {
  storage.addModelDefaultField(obj.constructor as typeof Model, key);
}

prop['defaultValue'] = (value: any) => {
  return <T extends Model>(obj: T, key: string) => {
    storage.addModelDefaultField(obj.constructor as typeof Model, key, value);
  };
};

// TODO:
// * toOne - define one-to-one relationship
// * toMany - define one-to-many relationship
// * toOneOrMany - define one-to-N relationship
// * identifier - select the field as an identifier

export default prop as IProp;

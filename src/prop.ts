import {ReferenceType} from './enums/ReferenceType';
import {IProp} from './interfaces/IProp';
import {Model} from './Model';
import {storage} from './services/storage';

function prop<T extends Model>(obj: T, key: string) {
  storage.addModelDefaultField(obj.constructor as typeof Model, key);
  return prop as IProp;
}

prop['defaultValue'] = (value: any) => {
  return <T extends Model>(obj: T, key: string) => {
    storage.addModelDefaultField(obj.constructor as typeof Model, key, value);
    return prop as IProp;
  };
};

// TODO: Add support for back reference?
prop['toOne'] = (refModel: typeof Model) => {
  return <T extends Model>(obj: T, key: string) => {
    storage.addModelClassReference(obj.constructor as typeof Model, key, {
      model: refModel,
      type: ReferenceType.TO_ONE,
    });
    return prop as IProp;
  };
};

prop['toMany'] = (refModel: typeof Model, property?: string) => {
  return <T extends Model>(obj: T, key: string) => {
    storage.addModelClassReference(obj.constructor as typeof Model, key, {
      model: refModel,
      property,
      type: ReferenceType.TO_MANY,
    });
    return prop as IProp;
  };
};

prop['toOneOrMany'] = (refModel: typeof Model) => {
  return <T extends Model>(obj: T, key: string) => {
    storage.addModelClassReference(obj.constructor as typeof Model, key, {
      model: refModel,
      type: ReferenceType.TO_ANY,
    });
    return prop as IProp;
  };
};

// TODO: identifier - select the field as an identifier

export default prop as IProp;

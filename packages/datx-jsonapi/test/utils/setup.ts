import {Collection, ICollectionConstructor, IModelConstructor, IType, Model, prop} from 'datx';
import {IDictionary} from 'datx-utils';
import {computed} from 'mobx';

import {IJsonapiCollection, IJsonapiModel, jsonapi} from '../../src';

// tslint:disable:max-classes-per-file

@jsonapi
export class User extends Model {
  public static type: IType = 'user';

  @prop public firstName!: string;
  @prop public lastName!: string;

  @computed get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

@jsonapi
export class Image extends Model {
  public static type: IType = 'images';

  @prop public name!: string;
  @prop.toOne('events') public event!: any;
}

@jsonapi
export class Organiser extends User {
  public static type: IType = 'organisers';

  @prop.toOne(Image) public image!: Image;
}

export class EventModel extends Model {
  public static type: IType = 'events';

  @prop public name!: string;
  @prop.toMany(Organiser) public organisers!: Array<Organiser>;
  @prop.toMany(Image) public images!: Array<Image>;
  @prop.toOne(Image) public image!: Image;
  @prop public imagesLinks!: IDictionary<string>;
}

export const Event = jsonapi(EventModel);

export class PhotoModel extends Model {
  public static type: IType = 'photo';

  @prop.defaultValue(false) public selected!: boolean;
}

export const Photo = jsonapi(PhotoModel);

export class TestStoreCollection extends Collection {
  public static types = [User, Event, Image, Organiser, Photo];
}

export const TestStore = jsonapi(TestStoreCollection);

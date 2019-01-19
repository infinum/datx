import { Collection } from 'datx';

import { jsonapi } from '../../src';
import { Event } from './models/Event';
import { Image } from './models/Image';
import { Organizer } from './models/Organizer';
import { Photo } from './models/Photo';
import { User } from './models/User';

export {
  Event,
  Image,
  Organizer,
  Photo,
  User,
};

export class TestStoreCollection extends Collection {
  public static types = [User, Event, Image, Organizer, Photo];
}

export const TestStore = jsonapi(TestStoreCollection);

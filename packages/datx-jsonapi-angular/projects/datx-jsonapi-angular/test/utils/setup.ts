import { Collection } from '@datx/core';

import { jsonapiAngular } from '../../src/public-api';
import { Event } from './models/Event';
import { Image } from './models/Image';
import { LineItem } from './models/LineItem';
import { Organizer } from './models/Organizer';
import { Photo } from './models/Photo';
import { ProductVariant } from './models/ProductVariant';
import { User } from './models/User';

export { Event, Image, Organizer, Photo, User, ProductVariant, LineItem };

export class TestStore extends jsonapiAngular(Collection) {
  public static types = [User, Event, Image, Organizer, Photo, ProductVariant, LineItem];
}

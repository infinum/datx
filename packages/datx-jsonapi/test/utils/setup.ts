import { Collection } from 'datx';

import { jsonapi } from '../../src';
import { Cart } from './models/Cart';
import { Event } from './models/Event';
import { Image } from './models/Image';
import { LineItem } from './models/LineItem';
import { Multitrack } from './models/Multitrack';
import { Organizer } from './models/Organizer';
import { Photo } from './models/Photo';
import { Product } from './models/Product';
import { ProductVariant } from './models/ProductVariant';
import { User } from './models/User';

export {
  Event,
  Image,
  Organizer,
  Photo,
  User,
  Multitrack,
  Product,
  ProductVariant,
  LineItem,
  Cart,
};

export class TestStoreCollection extends Collection {
  public static types = [
    User,
    Event,
    Image,
    Organizer,
    Photo,
    Multitrack,
    ProductVariant,
    LineItem,
    Cart,
  ];
}

export const TestStore = jsonapi(TestStoreCollection);

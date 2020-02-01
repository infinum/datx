import { Collection } from 'datx';
import { jsonapi } from 'datx-jsonapi';

import { Event, Person, Pet } from './models';

export class AppCollection extends jsonapi(Collection) {
  public static types = [Event, Person, Pet];

  public token?: string;
}

export default new AppCollection();

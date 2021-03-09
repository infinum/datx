import { Collection } from '@datx/core';

import { Event, Person, Pet } from './models';

export class AppCollection extends Collection {
  public static types = [Event, Person, Pet];
}

export default new AppCollection();

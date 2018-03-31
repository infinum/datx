import {Collection} from 'datx';

import {Event, Person, Pet} from './models';

export class AppCollection extends Collection {
  public static types = [Event, Person, Pet];
}

export default new AppCollection();

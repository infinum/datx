import { Attribute, Model } from '../../src';
import Person from './Person';

export default class Toy extends Model {
  static type = 'toy';

  @Attribute() public name!: string;
  @Attribute({ toMany: () => Person }) public owners!: Person[];
}

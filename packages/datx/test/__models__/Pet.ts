import { Attribute, Model } from '../../src';
import Person from './Person';
export default class Pet extends Model {
  static type = 'pet';

  @Attribute() public name!: string;
  @Attribute({ toOne: () => Person }) public owner!: Person;
}

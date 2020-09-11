import { Attribute, Model } from '../../src';
import Pet from './Pet';
import Toy from './Toy';

export default class Person extends Model {
  static type = 'person';

  @Attribute({ isIdentifier: true }) id!: number;

  @Attribute() public firstName!: string;

  @Attribute() public lastName!: string;

  @Attribute({ toMany: Pet, referenceProperty: 'owner' }) pets!: Array<Pet>;
  @Attribute({ toMany: Toy, referenceProperty: 'owners' }) toys!: Array<Toy>;
}

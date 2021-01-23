/* eslint-disable no-console */

import { Event, Person, Pet } from './models';
import state from './store';

const john = new Person({ name: 'John' });

state.add(john);

// Alternative syntax:
const jane = state.add({ name: 'Jane' }, Person);

const fido = state.add({ name: 'Fido', owner: john }, Pet);

console.log(john.pets); // [Fido]

const party = state.add(
  {
    name: 'Party',
    responsible: jane,
    organizers: [jane, { name: 'Frank', spouse: jane }, john],
  },
  Event,
);

const frank = party.organizers[1];

console.log(frank.spouse.name); // Jane
console.log(frank.organizing); // [Party]

console.log(jane.responsibleFor); // [Party]
console.log(john.responsibleFor); // []

console.log(john.organizing); // [Party]
party.organizers.pop();
console.log(john.organizing); // []

// Want more examples? Please open an issue with suggestions: https://github.com/infinum/datx/issues/new

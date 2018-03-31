// Set up the network before using the lib
import './network';

import {Event, Person, Pet} from './models';
import state from './store';

(async function() {

  // Fetch all events (or only the first page if the API is paginating!) with responsible people and organizers
  const eventsResponse1 = await state.fetchAll(Event, {include: ['responsible', 'organizers']});

  // The data is available in the data property
  // In case of an error, the fetchAll function would throw with the same Response object, but it would contain an error property
  const events1 = eventsResponse1.data as Array<Event>;

  console.log(events1.length); // 15
  console.log(events1[2].responsible.name); // "John"

  // Get all people from the store. In this case all people related to the event
  const people = state.findAll(Person);
  console.log(people.length); // 12

  console.log(people[1].organizing); // [Event1, Event3]
  // Note: Since this is a indirect reference, the data is only calculated from the local data.
  // It is possible the person is an organizer of more events that aren't yet loaded

  // Load the next page if it exists
  if ('next' in eventsResponse1) {
    const eventsResponse2 = await eventsResponse1.next;
    const events2 = eventsResponse2.data as Array<Event>;
    console.log(events2.length); // 7

    console.log(state.findAll(Event).length); // 22 (15 + 7)

    console.log(people[1].organizing); // [Event1, Event3, Event19, Event22]
    // Note: Since this is a indirect reference, the data is only calculated from the local data.
    // It is possible the person is an organizer of more events that aren't yet loaded

    console.log(state.findAll(Person).length); // 16 (4 new people, others were merged)
  }

  const party = state.find(Event, 2);
  const john = state.find(Person, (item) => item.name === 'John');

  console.log(party.responsible.name); // "Frank"
  party.responsible = john;
  await party.save(); // Save the change to the server

  const party2 = state.find(Event, 14);
  await party2.destroy(); // Remove the model from the server and local store
})();

// Want more examples? Please open an issue with suggestions: https://github.com/infinum/datx/issues/new

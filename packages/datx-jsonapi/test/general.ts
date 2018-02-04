import {Collection, Model} from 'datx';
import {IDictionary} from 'datx-utils';
import {autorun, extendObservable, observable} from 'mobx';

import {config, jsonapi} from '../src';
import {Event, Image, Organiser, Photo, TestStore, User} from './utils/setup';

// tslint:disable:no-string-literal

describe('General', () => {
  it('should initialize', () => {
    const store = new TestStore();
    expect(store).toBeTruthy();
  });

  it('should sync an event', () => {
    const store = new TestStore();
    const event = store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        type: 'events',
      },
    }) as Event;

    expect(event.name).toBe('Demo');
  });

  xit('should handle missing reference', () => {
    const store = new TestStore();
    const event = store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          image: {
            data: {
              id: 1,
              type: 'image',
            },
          },
        },
        type: 'events',
      },
    }) as Event;

    expect(event.name).toBe('Demo');
    expect(event.meta.refs.image).toBe(1);
    expect(event.image).toBeNull();
  });

  // it('should find an event', () => {
  //   const store = new TestStore();
  //   const ev = store.sync({
  //     data: {
  //       attributes: {
  //         name: 'Demo',
  //       },
  //       id: 1,
  //       type: 'events',
  //     },
  //   }) as Event;

  //   const event = store.find(Event, 1);
  //   expect(event.meta.id).toBe(1);
  //   expect(event.meta.type).toBe('events');
  //   expect(event.name).toBe('Demo');
  // });

  // it('should trigger autorun on change', (done) => {
  //   const store = new TestStore();
  //   store.sync({
  //     data: {
  //       attributes: {
  //         name: 'Demo',
  //       },
  //       id: 1,
  //       type: 'events',
  //     },
  //   });

  //   let name = 'Demo';

  //   const event = store.find(Event, 1);
  //   expect(event.name).toBe('Demo');

  //   autorun(() => {
  //     expect(event.name).toBe(name);

  //     if (name === 'Foo') {
  //       done();
  //     }
  //   });

  //   name = 'Foo';
  //   event.name = 'Foo';
  // });

  // it('should handle relationships with duplicates', () => {
  //   const store = new TestStore();
  //   store.sync({
  //     data: {
  //       attributes: {
  //         name: 'Demo',
  //       },
  //       id: 1,
  //       relationships: {
  //         images: {
  //           data: [{
  //             id: 2,
  //             type: 'images',
  //           }],
  //         },
  //       },
  //       type: 'events',
  //     },
  //     included: [{
  //       attributes: {
  //         name: 'Header',
  //       },
  //       id: 2,
  //       type: 'images',
  //     }, {
  //       attributes: {
  //         name: 'Header',
  //       },
  //       id: 2,
  //       type: 'images',
  //     }],
  //   });

  //   const event = store.find(Event, 1);
  //   expect(event.name).toBe('Demo');
  //   expect(event.images.length).toBe(1);

  //   const images = store.findAll('images');
  //   expect(images.length).toBe(1);

  //   const foo = store.findAll('foo');
  //   expect(foo.length).toBe(0);
  // });

  // it('should handle relationship elements without links attribute', () => {
  //   const store = new TestStore();
  //   store.sync({
  //     data: {
  //       attributes: {
  //         name: 'Demo',
  //       },
  //       id: 1,
  //       relationships: {
  //         image: {
  //           data: {
  //             id: 2,
  //             type: 'images',
  //           },
  //         },
  //       },
  //       type: 'events',
  //     },
  //   });

  //   const event = store.find(Event, 1);
  //   expect(event.name).toBe('Demo');
  //   expect(event.image).toBe(null);
  // });

  // it('should handle basic circular relations', () => {
  //   const store = new TestStore();
  //   store.sync({
  //     data: {
  //       attributes: {
  //         name: 'Demo',
  //       },
  //       id: 1,
  //       relationships: {
  //         images: {
  //           data: [{
  //             id: 2,
  //             type: 'images',
  //           }],
  //         },
  //       },
  //       type: 'events',
  //     },
  //     included: [{
  //       attributes: {
  //         name: 'Header',
  //       },
  //       id: 2,
  //       relationships: {
  //         event: {
  //           data: {
  //             id: 1,
  //             type: 'events',
  //           },
  //         },
  //       },
  //       type: 'images',
  //     }],
  //   });

  //   const event = store.find(Event, 1);
  //   expect(event.name).toBe('Demo');
  //   expect(event.images[0].name).toBe('Header');
  //   expect(event.images[0].event.meta.id).toBe(1);
  // });

  // it('should return a event with all associated objects', () => {
  //   const store = new TestStore();
  //   store.sync({
  //     data: {
  //       attributes: {
  //         name: 'Nordic.js',
  //         slug: 'nordicjs',
  //       },
  //       id: 1,
  //       relationships: {
  //         images: {
  //           data: [
  //             {type: 'images', id: 1},
  //             {type: 'images', id: 2},
  //             {type: 'images', id: 3},
  //           ],
  //         },
  //         organisers: {
  //           data: [
  //             {type: 'organisers', id: 1},
  //             {type: 'organisers', id: 2},
  //           ],
  //         },
  //       },
  //       type: 'events',
  //     }, included: [{
  //       attributes: {
  //         firstName: 'Jonny',
  //       },
  //       id: 1,
  //       relationships: {
  //         event: {
  //           data: {type: 'events', id: 1},
  //         },
  //         image: {
  //           data: {type: 'images', id: 2},
  //         },
  //       },
  //       type: 'organisers',
  //     }, {
  //       attributes: {
  //         firstName: 'Martina',
  //       },
  //       id: 2,
  //       relationships: {
  //         event: {
  //           data: {type: 'events', id: 1},
  //         },
  //         image: {
  //           data: {type: 'images', id: 3},
  //         },
  //       },
  //       type: 'organisers',
  //     }, {
  //       attributes: {
  //         name: 'Header',
  //       },
  //       id: 1,
  //       relationships: {
  //         event: {
  //           data: {type: 'events', id: 1},
  //         },
  //       },
  //       type: 'images',
  //     }, {
  //       attributes: {
  //         name: 'Organiser Johannes',
  //       },
  //       id: 2,
  //       relationships: {
  //         event: {
  //           data: {type: 'events', id: 1},
  //         },
  //       },
  //       type: 'images',
  //     }, {
  //       attributes: {
  //         name: 'Organiser Martina',
  //       },
  //       id: 3,
  //       relationships: {
  //         event: {
  //           data: {type: 'events', id: 1},
  //         },
  //       },
  //       type: 'images',
  //     }],
  //   });

  //   const event = store.find(Event, 1);
  //   expect(event.organisers.length).toBe(2);
  //   expect(event.images.length).toBe(3);
  //   expect(event.organisers[0].image.getRecordId()).toBe(2);
  // });

  // it('should remove an event', () => {
  //   const store = new TestStore();
  //   store.sync({
  //     data: [
  //       {id: 1, type: 'events', attributes: {}},
  //       {id: 2, type: 'events', attributes: {}},
  //     ],
  //   });

  //   const event = store.find(Event, 1);
  //   expect(event.getRecordId()).toBe(1);
  //   store.remove('events', 1);
  //   const event2 = store.find(Event, 1);
  //   expect(event2).toBe(null);
  // });

  // it('should remove all events', () => {
  //   const store = new TestStore();
  //   store.sync({
  //     data: [
  //       {id: 1, type: 'events', attributes: {}},
  //       {id: 2, type: 'events', attributes: {}},
  //     ],
  //   });

  //   const events = store.findAll(Event);
  //   expect(events.length).toBe(2);
  //   store.removeAll(Event);
  //   const events2 = store.findAll(Event);
  //   expect(events2).toEqual([]);
  // });

  // it('should reset', () => {
  //   const store = new TestStore();
  //   store.sync({
  //     data: [{
  //       attributes: {
  //         name: 'Demo',
  //       },
  //       id: 1,
  //       relationships: {
  //         images: {
  //           data: [{
  //             id: 2,
  //             type: 'images',
  //           }],
  //         },
  //       },
  //       type: 'events',
  //     }, {
  //       attributes: {
  //         name: 'Demo 2',
  //       },
  //       id: 2,
  //       type: 'events',
  //     }],
  //     included: [{
  //       attributes: {
  //         name: 'Header',
  //       },
  //       id: 2,
  //       relationships: {
  //         event: {
  //           data: {type: 'events', id: 1},
  //         },
  //       },
  //       type: 'images',
  //     }],
  //   });

  //   const events = store.findAll(Event);
  //   const images = store.findAll('images');
  //   expect(events.length).toBe(2);
  //   expect(images.length).toBe(1);

  //   store.reset();

  //   const events2 = store.findAll(Event);
  //   const images2 = store.findAll('images');
  //   expect(events2).toEqual([]);
  //   expect(images2).toEqual([]);
  // });

  // it('should handle circular relations', () => {
  //   const store = new TestStore();
  //   store.sync({
  //     data: {
  //       attributes: {
  //         name: 'Demo',
  //       },
  //       id: 1,
  //       relationships: {
  //         images: {
  //           links: {
  //             self: 'http://example.com/events/1/relationships/images',
  //           },
  //         },
  //       },
  //       type: 'events',
  //     },
  //   });

  //   const event = store.find(Event, 1);
  //   expect(event.name).toBe('Demo');
  //   expect(event.getRelationshipLinks()['images'])
  //     .to.deep.equal({self: 'http://example.com/events/1/relationships/images'});
  // });

  // it('should handle serialization/deserialization with circular relations', () => {
  //   const store = new TestStore();
  //   store.sync({
  //     data: {
  //       attributes: {
  //         name: 'Demo',
  //       },
  //       id: 1,
  //       relationships: {
  //         images: {
  //           links: {
  //             self: 'http://example.com/events/1/relationships/images',
  //           },
  //         },
  //       },
  //       type: 'events',
  //     },
  //   });

  //   const data = JSON.stringify(store.toJS());

  //   const newStore = new TestStore(JSON.parse(data));

  //   const event = newStore.find(Event, 1);
  //   expect(event.name).toBe('Demo');
  //   expect(event.getRelationshipLinks()['images'])
  //     .to.deep.equal({self: 'http://example.com/events/1/relationships/images'});
  // });

  // it('should support custom models', () => {
  //   const store = new TestStore();

  //   store.sync({
  //     data: {
  //       attributes: {
  //         firstName: 'John',
  //         lastName: 'Doe',
  //       },
  //       id: 1,
  //       type: 'user',
  //     },
  //   });

  //   const user = store.find(User, 1);
  //   expect(user.fullName).toBe('John Doe');
  // });

  // it('should support default properties', () => {
  //   const store = new TestStore();

  //   store.sync({
  //     data: [
  //       {
  //         attributes: {
  //           firstName: 'John',
  //           lastName: 'Doe',
  //         },
  //         id: 1,
  //         type: 'user',
  //       }, {
  //         attributes: {
  //           filename: 'foo.jpg',
  //         },
  //         id: 1,
  //         type: 'photo',
  //       }, {
  //         attributes: {
  //           filename: 'bar.png',
  //           selected: true,
  //         },
  //         id: 2,
  //         type: 'photo',
  //       }, {
  //         attributes: {
  //           filename: 'baz.png',
  //           selected: false,
  //         },
  //         id: 3,
  //         type: 'photo',
  //       },
  //     ],
  //   });

  //   const user = store.find(User, 1);
  //   expect(user['selected']).toBeUndefined();

  //   const photo1 = store.find(Photo, 1);
  //   expect(photo1.selected).toBe(false);
  //   expect(photo1['foo']).not.toBe(false);
  //   expect(photo1['foo']).toBeUndefined();

  //   const photo2 = store.find(Photo, 2);
  //   expect(photo2.selected).toBe(true);
  //   const photo3 = store.find(Photo, 3);
  //   expect(photo3.selected).toBe(false);

  //   const photos = store.findAll(Photo);
  //   const selected = photos.filter((photo) => photo.selected);
  //   expect(selected.length).toBe(1);
  //   expect(selected[0].meta.id).toBe(2);
  // });

  // it('should support generic records', () => {
  //   const JsonapiCollection = jsonapi(Collection);
  //   const store = new JsonapiCollection();
  //   const user = store.sync({
  //     data: {
  //       attributes: {
  //         name: 'John',
  //       },
  //       id: 1,
  //       relationships: {
  //         self: {
  //           data: {
  //             id: 1,
  //             type: 'user',
  //           },
  //         },
  //       },
  //       type: 'user',
  //     },
  //   }) as Model;

  //   expect(user['name']).toBe('John');
  //   expect(user['self'].getRecordId()).toBe(1);
  //   expect(store.findAll('user').length).toBe(1);
  // });
});

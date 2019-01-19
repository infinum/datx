import { Collection, getModelId, getModelType, Model } from 'datx';
import { autorun } from 'mobx';

import { getModelRefLinks, jsonapi, modelToJsonApi } from '../src';
import { Event, Image, Photo, TestStore, User } from './utils/setup';

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
        type: 'event',
      },
    }) as Event;

    expect(event.name).toBe('Demo');
  });

  it('should handle empty array reference', () => {
    const store = new TestStore();
    const event = store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            data: [],
          },
        },
        type: 'event',
      },
    }) as Event;

    expect(event.name).toBe('Demo');
  });

  it('should handle empty reference', () => {
    const store = new TestStore();
    const event = store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          image: { },
        },
        type: 'event',
      },
    }) as Event;

    expect(event.name).toBe('Demo');
  });

  it('should handle missing reference', () => {
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
        type: 'event',
      },
    }) as Event;

    expect(event.name).toBe('Demo');
    expect(event.meta.refs.image).toBe(1);
    expect(event.image).toBeNull();
  });

  it('should find an event', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        type: 'event',
      },
    });

    const event = store.find(Event , 1);
    expect(event).not.toBeNull();
    if (event) {
      expect(event.meta.id).toBe(1);
      expect(event.meta.type).toBe('event');
      expect(event.name).toBe('Demo');
    }
  });

  it('should trigger autorun on change', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        type: 'event',
      },
    });

    const event = store.find(Event, 1);

    expect(event).toBeInstanceOf(Event);
    if (event) {
      let name = 'Demo';
      let autorunCount = 0;
      autorun(() => {
        expect(event.name).toBe(name);
        autorunCount++;
      });

      name = 'Foo';
      event.name = 'Foo';
      expect(autorunCount).toBe(2);
    }
  });

  it('should handle relationships with duplicates', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            data: [{
              id: 2,
              type: 'image',
            }],
          },
        },
        type: 'event',
      },
      included: [{
        attributes: {
          name: 'Header',
        },
        id: 2,
        type: 'image',
      }, {
        attributes: {
          name: 'Header',
        },
        id: 2,
        type: 'image',
      }],
    });

    const event = store.find(Event, 1);
    expect(event).not.toBeNull();
    if (event) {
      expect(event.name).toBe('Demo');
      expect(event.images.length).toBe(1);
    }

    const images = store.findAll(Image);
    expect(images.length).toBe(1);

    const foo = store.findAll('foo');
    expect(foo.length).toBe(0);
  });

  it('should handle relationship elements without links attribute', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          image: {
            data: {
              id: 2,
              type: 'images',
            },
          },
        },
        type: 'event',
      },
    });

    const event = store.find(Event, 1);
    expect(event).not.toBeNull();
    if (event) {
      expect(event.name).toBe('Demo');
      expect(event.image).toBe(null);
    }
  });

  it('should handle basic circular relations', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            data: [{
              id: 2,
              type: 'image',
            }],
          },
        },
        type: 'event',
      },
      included: [{
        attributes: {
          name: 'Header',
        },
        id: 2,
        relationships: {
          event: {
            data: {
              id: 1,
              type: 'event',
            },
          },
        },
        type: 'image',
      }],
    });

    const event = store.find(Event, 1);
    expect(event).not.toBeNull();
    if (event) {
      expect(event.name).toBe('Demo');
      expect(event.images[0].name).toBe('Header');
      expect(event.images[0].event.meta.id).toBe(1);
    }
  });

  it('should return a event with all associated objects', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Meetup',
          slug: 'meetup-1',
        },
        id: 1,
        relationships: {
          images: {
            data: [
              { type: 'image', id: 1 },
              { type: 'image', id: 2 },
              { type: 'image', id: 3 },
            ],
          },
          organizers: {
            data: [
              { type: 'organizers', id: 1 },
              { type: 'organizers', id: 2 },
            ],
          },
        },
        type: 'event',
      }, included: [{
        attributes: {
          firstName: 'John',
        },
        id: 1,
        relationships: {
          event: {
            data: { type: 'event', id: 1 },
          },
          image: {
            data: { type: 'image', id: 2 },
          },
        },
        type: 'organizers',
      }, {
        attributes: {
          firstName: 'Jane',
        },
        id: 2,
        relationships: {
          event: {
            data: { type: 'event', id: 1 },
          },
          image: {
            data: { type: 'image', id: 3 },
          },
        },
        type: 'organizers',
      }, {
        attributes: {
          name: 'Sam',
        },
        id: 1,
        relationships: {
          event: {
            data: { type: 'event', id: 1 },
          },
        },
        type: 'image',
      }, {
        attributes: {
          name: 'Organizer Sam',
        },
        id: 2,
        relationships: {
          event: {
            data: { type: 'event', id: 1 },
          },
        },
        type: 'image',
      }, {
        attributes: {
          name: 'Organizer Jane',
        },
        id: 3,
        relationships: {
          event: {
            data: { type: 'event', id: 1 },
          },
        },
        type: 'image',
      }],
    });

    const event = store.find(Event, 1);
    expect(event).not.toBeNull();
    if (event) {
      expect(event.organizers.length).toBe(2);
      expect(event.images.length).toBe(3);
      expect(event.organizers[0].image.meta.id).toBe(2);
    }
  });

  it('should remove an event', () => {
    const store = new TestStore();
    store.sync({
      data: [
        { id: 1, type: 'event', attributes: { } },
        { id: 2, type: 'event', attributes: { } },
      ],
    });

    const event = store.find(Event, 1);
    expect(event).not.toBeNull();
    if (event) {
      expect(event.meta.id).toBe(1);
    }
    store.remove(Event, 1);
    const event2 = store.find(Event, 1);
    expect(event2).toBe(null);
  });

  it('should remove all events', () => {
    const store = new TestStore();
    store.sync({
      data: [
        { id: 1, type: 'event', attributes: { } },
        { id: 2, type: 'event', attributes: { } },
      ],
    });

    const events = store.findAll(Event);
    expect(events.length).toBe(2);
    store.removeAll(Event);
    const events2 = store.findAll(Event);
    expect(events2).toHaveLength(0);
  });

  it('should reset', () => {
    const store = new TestStore();
    store.sync({
      data: [{
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            data: [{
              id: 2,
              type: 'image',
            }],
          },
        },
        type: 'event',
      }, {
        attributes: {
          name: 'Demo 2',
        },
        id: 2,
        type: 'event',
      }],
      included: [{
        attributes: {
          name: 'Header',
        },
        id: 2,
        relationships: {
          event: {
            data: { type: 'event', id: 1 },
          },
        },
        type: 'image',
      }],
    });

    const events = store.findAll(Event);
    const images = store.findAll(Image);
    expect(events.length).toBe(2);
    expect(images.length).toBe(1);

    store.reset();

    const events2 = store.findAll(Event);
    const images2 = store.findAll(Image);
    expect(events2).toHaveLength(0);
    expect(images2).toHaveLength(0);
  });

  it('should handle circular relations', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            links: {
              self: 'https://example.com/events/1/relationships/images',
            },
          },
        },
        type: 'event',
      },
    });

    const event = store.find(Event, 1);
    expect(event).not.toBeNull();

    if (event) {
      expect(event.name).toBe('Demo');
      expect(getModelRefLinks(event).images)
        .toEqual({ self: 'https://example.com/events/1/relationships/images' });
    }
  });

  it('should handle serialization/deserialization with circular relations', () => {
    const store = new TestStore();
    store.sync({
      data: {
        attributes: {
          name: 'Demo',
        },
        id: 1,
        relationships: {
          images: {
            links: {
              self: 'https://example.com/events/1/relationships/images',
            },
          },
        },
        type: 'event',
      },
    });

    const data = JSON.stringify(store.toJSON());

    const newStore = new TestStore(JSON.parse(data));

    const event = newStore.find(Event, 1);
    expect(event).not.toBeNull();

    if (event) {
      expect(event.name).toBe('Demo');
      expect(getModelRefLinks(event).images)
        .toEqual({ self: 'https://example.com/events/1/relationships/images' });
    }
  });

  it('should support custom models', () => {
    const store = new TestStore();

    store.sync({
      data: {
        attributes: {
          firstName: 'John',
          lastName: 'Doe',
        },
        id: 1,
        type: 'user',
      },
    });

    const user = store.find(User, 1);
    expect(user).not.toBeNull();

    if (user) {
      expect(user.fullName).toBe('John Doe');
    }
  });

  it('should support default properties', () => {
    const store = new TestStore();

    store.sync({
      data: [
        {
          attributes: {
            firstName: 'John',
            lastName: 'Doe',
          },
          id: 1,
          type: 'user',
        }, {
          attributes: {
            filename: 'foo.jpg',
          },
          id: 1,
          type: 'photo',
        }, {
          attributes: {
            filename: 'bar.png',
            selected: true,
          },
          id: 2,
          type: 'photo',
        }, {
          attributes: {
            filename: 'baz.png',
            selected: false,
          },
          id: 3,
          type: 'photo',
        },
      ],
    });

    const user = store.find(User, 1);
    expect(user).not.toBeNull();

    if (user) {
      expect(user['selected']).toBeUndefined();
    }

    const photo1 = store.find(Photo, 1);
    expect(photo1).not.toBeNull();
    if (photo1) {
      expect(photo1.selected).toBe(false);
      expect(photo1['foo']).not.toBe(false);
      expect(photo1['foo']).toBeUndefined();
    }

    const photo2 = store.find(Photo, 2);
    expect(photo2).not.toBeNull();
    if (photo2) {
      expect(photo2.selected).toBe(true);
    }

    const photo3 = store.find(Photo, 3);
    expect(photo3).not.toBeNull();
    if (photo3) {
      expect(photo3.selected).toBe(false);
    }

    const photos = store.findAll(Photo);
    const selected = photos.filter((photo) => photo.selected);
    expect(selected.length).toBe(1);
    expect(selected[0].meta.id).toBe(2);
  });

  it('should support generic records', () => {
    const JsonapiCollection = jsonapi(Collection);
    const store = new JsonapiCollection();
    const user = store.sync({
      data: {
        attributes: {
          name: 'John',
        },
        id: 1,
        relationships: {
          self: {
            data: {
              id: 1,
              type: 'user',
            },
          },
        },
        type: 'user',
      },
    });

    if (user instanceof Model) {
      expect(user['name']).toBe('John');
      expect(getModelId(user['self'])).toBe(1);
      expect(getModelType(user)).toBe('user');
      expect(store.findAll('user').length).toBe(1);
    }
  });

  it('should serialize empty relationships', () => {
    const event = new Event({ name: 'Foo' });

    const data = modelToJsonApi(event);

    expect(data.attributes && 'id' in data.attributes).toBe(false);
    expect(data.relationships).not.toBeUndefined();
    if (data.relationships) {
      expect(data.relationships.images.data).toHaveLength(0);
      expect(data.relationships.image.data).toBeNull();
    }
  });

  it('should serialize model id correctly', () => {
    const event = new Event({ id: '1234', name: 'Foo' });

    const data = modelToJsonApi(event);

    expect(data.attributes && 'id' in data.attributes).toBe(false);
    if (data.relationships) {
      expect(data.relationships.images.data).toHaveLength(0);
      expect(data.relationships.image.data).toBeNull();
    }
  });
});

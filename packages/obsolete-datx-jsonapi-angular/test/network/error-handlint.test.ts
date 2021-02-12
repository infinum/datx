import { config, CachingStrategy } from '@datx/jsonapi';
import { setupNetwork, confirmNetwork, setRequest } from '../utils/api';
import { TestStore } from '../utils/setup';

describe('error handling', () => {
  beforeEach(() => {
    config.baseUrl = 'https://example.com/';
    config.cache = CachingStrategy.NetworkOnly;
    setupNetwork();
  });

  afterEach(confirmNetwork);

  it('should handle network failure', (done) => {
    const store = new TestStore();

    setRequest({
      name: 'events-1',
      status: 404,
      url: 'event',
    });

    store.getMany('event').subscribe(() => {
      done(new Error('Should have failed'));
    }, (err) => {
      expect(err).toBeInstanceOf(Object);
      expect(err.status).toBe(404);
      expect(err.message).toBe('Invalid HTTP status: 404');
      done();
    });
  });

  it('should handle invalid responses', (done) => {
    const store = new TestStore();

    setRequest({
      name: 'invalid',
      url: 'event',
    });

    store.getMany('event').subscribe(() => {
      done(new Error('Should have failed'));
    }, (response) => {
      expect(response.error).toBeInstanceOf(Error);
      done();
    });
  });
});
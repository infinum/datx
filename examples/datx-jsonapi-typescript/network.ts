import { config } from '@datx/jsonapi';
import * as fetch from './isomorphic-fetch'; // Or any other fetch lib

// Don't need if fetch is polyfilled before the lib is loaded
config.fetchReference = fetch;

// Defaults to "/"
config.baseUrl = 'https://example.com/api/v1/';

// Example how to set auth tokens dynamically
config.transformRequest = function(options) {
  if (options.collection && options.collection['token']) {
    options.options = options.options || {};
    options.options.headers = options.options.headers || {};
    options.options.headers['Auth'] = options.collection['token'];
  }
  return options;
};

// Example how to save auth tokens dynamically
config.transformResponse = function(options) {
  if (options.collection && options.headers && options.headers.get('Set-Auth')) {
    options.collection['token'] = options.headers.get('Set-Auth');
  }
  return options;
};

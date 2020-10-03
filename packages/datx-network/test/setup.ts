import { configure } from 'mobx';
import { clearAllCache } from '../src/interceptors/cache';

configure({
  enforceActions: 'observed',
  // computedRequiresReaction: true,
});

beforeEach(() => {
  clearAllCache();
});

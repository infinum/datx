// eslint-disable-next-line @typescript-eslint/no-var-requires
const { clearAllCache } = require('../src/interceptors/cache');

beforeEach(() => {
  clearAllCache();
});

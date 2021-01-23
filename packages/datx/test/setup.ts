if (parseInt(process.env.MOBX_VERSION || '0', 10) < 0) {
  require('../src/disable-mobx');
}
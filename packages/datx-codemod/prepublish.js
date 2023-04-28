const fs = require('fs');

const packageJson = require('./package.json');

delete packageJson.scripts;
delete packageJson.devDependencies;
delete packageJson.jest;
delete packageJson.husky;

const distPackageJson = {
  ...packageJson,
  bin: './bin/datx-codemod.js',
};

fs.writeFileSync('./dist/package.json', JSON.stringify(distPackageJson, null, 2));

fs.copyFileSync('./README.md', './dist/README.md');
fs.copyFileSync('./LICENSE', './dist/LICENSE');

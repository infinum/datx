/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');

const packageJson = require('./package.json');
const distPackageJson = require('./dist/package.json');

// Update package version
distPackageJson.version = packageJson.version;

// Update dependency versions
Object.keys(distPackageJson.peerDependencies).forEach((key) => {
  if (key.startsWith('@datx/')) {
    distPackageJson.peerDependencies[key] =
      packageJson.peerDependencies[key] || packageJson.devDependencies[key];
  }
});

fs.writeFileSync('./dist/package.json', JSON.stringify(distPackageJson, null, 2));

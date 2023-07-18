/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');

const packageJson = require('./package.json');
const distPackageJson = require('./dist/package.json');

// Update package version
distPackageJson.version = packageJson.version;

distPackageJson.peerDependencies = distPackageJson.peerDependencies || {};

// Update dependency versions
Object.keys(packageJson.dependencies).forEach((key) => {
  if (key.startsWith('@datx/')) {
    distPackageJson.peerDependencies[key] = packageJson.dependencies[key];
  }
});

fs.writeFileSync('./dist/package.json', JSON.stringify(distPackageJson, null, 2));

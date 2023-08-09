/* global jest */
jest.autoMockOff();
import { defineTest } from 'jscodeshift/dist/testUtils';
import { readdirSync } from 'fs';
import { join } from 'path';

const fixtureDir = 'jsonapi-pagination';
const fixtureDirPath = join(__dirname, '..', '__testfixtures__', fixtureDir);
const fixtures = readdirSync(fixtureDirPath)
  .filter((file) => file.endsWith('.input.ts'))
  .map((file) => file.replace('.input.ts', ''));

for (const fixture of fixtures) {
  const prefix = `${fixtureDir}/${fixture}`;

  defineTest(__dirname, fixtureDir, null, prefix, { parser: 'ts' });
}

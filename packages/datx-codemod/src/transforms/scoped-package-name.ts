import { API, FileInfo } from 'jscodeshift';

export const parser = 'tsx';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.ImportDeclaration).forEach((path) => {
    // Before: import * as utils from 'datx-utils';
    // After: import * as utils from '@datx/utils';
    if (path.node.source.value === 'datx-utils') {
      path.node.source.value = '@datx/utils';
    }

    // Before: import * as datx from 'datx';
    // After: import * as datx from '@datx/core';
    if (path.node.source.value === 'datx') {
      path.node.source.value = '@datx/core';
    }

    // Before: import * as jsonapi from 'datx-jsonapi';
    // After: import * as jsonapi from '@datx/jsonapi';
    if (path.node.source.value === 'datx-jsonapi') {
      path.node.source.value = '@datx/jsonapi';
    }
  });

  return root.toSource({
    quote: 'single',
    trailingComma: true,
  });
}

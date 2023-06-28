import { API, FileInfo } from 'jscodeshift';

export const parser = 'tsx';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Before: import { Model, Attribute } from '@datx/core';
  // After: import { Model, Field } from '@datx/core';
  root.find(j.ImportDeclaration).forEach((path) => {
    if (path.node.specifiers) {
      path.node.specifiers = path.node.specifiers.map((specifier) => {
        if (specifier.type === 'ImportSpecifier') {
          if (specifier.imported.name === 'Attribute') {
            specifier.imported.name = 'Field';
          }
        }

        return specifier;
      });
    }
  });

  root.find(j.ClassBody).forEach((path) => {
    // @ts-ignore
    path.node.body = path.node.body.map((node) => {
      if (node.type === 'ClassProperty') {
        // @ts-ignore
        node.decorators = node.decorators?.map((decorator) => {
          // Before: @Attribute()
          // After: @Field()
          if (decorator.expression?.callee?.name === 'Attribute') {
            decorator.expression.callee.name = 'Field';
          }

          return decorator;
        });
      }

      return node;
    });
  });

  return root.toSource({
    quote: 'single',
    trailingComma: true,
  });
}

import { API, FileInfo } from 'jscodeshift';

export const parser = 'tsx';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Before: import { Model, prop } from 'datx';
  // After: import { Model, Attribute } from '@datx/core';
  root.find(j.ImportDeclaration).forEach((path) => {
    if (path.node.source.value === 'datx') {
      path.node.source.value = '@datx/core';

      if (path.node.specifiers) {
        path.node.specifiers = path.node.specifiers.map((specifier) => {
          if (specifier.type === 'ImportSpecifier') {
            if (specifier.imported.name === 'prop') {
              specifier.imported.name = 'Attribute';
            }
          }
          return specifier;
        });
      }
    }
  });

  root.find(j.ClassBody).forEach((path) => {
    // @ts-ignore
    path.node.body = path.node.body.map((node) => {
      if (node.type === 'ClassProperty') {
        // @ts-ignore
        node.decorators = node.decorators?.map((decorator) => {
          // Before: @prop.identifier
          // After: @Attribute({ isType: true })
          if (decorator.expression?.property?.name === 'identifier') {
            decorator.expression = j.callExpression(j.identifier('Attribute'), [
              j.objectExpression([j.objectProperty(j.identifier('isIdentifier'), j.literal(true))]),
            ]);
          }

          // Before: @prop.identifier
          // After: @Attribute({ isType: true })
          else if (decorator.expression?.property?.name === 'type') {
            decorator.expression = j.callExpression(j.identifier('Attribute'), [
              j.objectExpression([j.objectProperty(j.identifier('isType'), j.literal(true))]),
            ]);
          }

          // Before: @prop.defaultValue(0)
          // After: @Attribute({ defaultValue: 0 })
          else if (decorator.expression?.callee?.property?.name === 'defaultValue') {
            decorator.expression = j.callExpression(j.identifier('Attribute'), [
              j.objectExpression([
                j.objectProperty(j.identifier('defaultValue'), decorator.expression.arguments[0]),
              ]),
            ]);
          }

          // Before: @prop.toOne(Person)
          // After: @Attribute({ toOne: Person })
          else if (decorator.expression.callee?.property?.name === 'toOne') {
            decorator.expression = j.callExpression(j.identifier('Attribute'), [
              j.objectExpression([
                j.objectProperty(j.identifier('toOne'), decorator.expression.arguments[0]),
              ]),
            ]);
          }

          // Before: @prop.toOneOrMany(Person)
          // After: @Attribute({ toOneOrMany: Person })
          else if (decorator.expression?.callee?.property?.name === 'toOneOrMany') {
            decorator.expression = j.callExpression(j.identifier('Attribute'), [
              j.objectExpression([
                j.objectProperty(j.identifier('toOneOrMany'), decorator.expression.arguments[0]),
              ]),
            ]);
          }

          // toMany has two argument variants
          else if (decorator.expression?.callee?.property?.name === 'toMany') {
            // Before: @prop.toMany(Person, 'backProp')
            // After: @Attribute({ toMany: Person, referenceProperty: 'backProp' })
            if (decorator.expression.arguments[1]) {
              decorator.expression = j.callExpression(j.identifier('Attribute'), [
                j.objectExpression([
                  j.objectProperty(j.identifier('toMany'), decorator.expression.arguments[0]),
                  j.objectProperty(
                    j.identifier('referenceProperty'),
                    decorator.expression.arguments[1],
                  ),
                ]),
              ]);
            }

            // Before: @prop.toMany(Person)
            // After: @Attribute({ toMany: Person })
            else {
              decorator.expression = j.callExpression(j.identifier('Attribute'), [
                j.objectExpression([
                  j.objectProperty(j.identifier('toMany'), decorator.expression.arguments[0]),
                ]),
              ]);
            }
          }

          // Before: @prop
          // After: @Attribute()
          else if (decorator.expression?.name === 'prop') {
            decorator.expression = j.callExpression(j.identifier('Attribute'), [
              ...(decorator.expression.arguments, []),
            ]);
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

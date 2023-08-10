import { API, FileInfo } from 'jscodeshift';

export const parser = 'tsx';

const allowedCallExpressionCalleeNames = [
  'fetch',
  'fetchAll',
  'getOne',
  'getMany',
  'getAll',
  'request',
  'removeOne',
  'removeAll',
  'save',
  'destroy',
];

const oldIRequestOptionsPropNames = [
  'headers',
  'include',
  'filter',
  'sort',
  'fields',
  'params',
  'skipCache',
];

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const oldIRequestOptionsObjectLiterals = root.find(j.ObjectExpression).filter((path) => {
    const props = path.get('properties');

    const propNames = props
      .filter((prop) => prop.node.type !== 'SpreadElement')
      .filter((prop) => {
        const parent = prop.parent.parent;

        if (
          parent.node.type === 'CallExpression' ||
          parent.node.type === 'OptionalCallExpression'
        ) {
          const callee = parent.node.callee;

          if (callee.type === 'MemberExpression' || callee.type === 'OptionalMemberExpression') {
            const name = callee.property.name;

            return allowedCallExpressionCalleeNames.includes(name);
          }

          return allowedCallExpressionCalleeNames.includes(callee.name);
        }
      })
      .map((prop) => prop.node.key.name);

    // Filter only headers, include, filter, sort, fields, params, skipCache props
    const allowedPropNames = propNames.filter((name) => oldIRequestOptionsPropNames.includes(name));

    if (allowedPropNames.length === 0) {
      return false;
    }

    if (allowedPropNames.length > 0) {
      // If object contains any of other props than it's not IRequestOptions object
      if (propNames.length !== allowedPropNames.length) {
        return false;
      }

      return true;
    }
  });

  // Convert old IRequestOptions object literals to new IRequestOptions object literals
  oldIRequestOptionsObjectLiterals.forEach((path) => {
    const props = path.get('properties');

    const newPropsNodes = [];

    for (const prop of props.value) {
      const name = prop.key.name;

      if (name === 'headers') {
        const networkConfig = newPropsNodes.find((prop) => prop.key.name === 'networkConfig');

        if (networkConfig) {
          networkConfig.value.properties.push(prop);
        } else {
          newPropsNodes.push(
            j.objectProperty(j.identifier('networkConfig'), j.objectExpression([prop])),
          );
        }
      }

      if (
        name === 'include' ||
        name === 'filter' ||
        name === 'sort' ||
        name === 'fields' ||
        name === 'params'
      ) {
        const queryParams = newPropsNodes.find((prop) => prop.key.name === 'queryParams');

        if (queryParams) {
          if (name === 'params') {
            queryParams.value.properties.push(j.objectProperty(j.identifier('custom'), prop.value));
          } else {
            queryParams.value.properties.push(prop);
          }
        } else if (name === 'params') {
          newPropsNodes.push(
            j.objectProperty(
              j.identifier('queryParams'),
              j.objectExpression([j.objectProperty(j.identifier('custom'), prop.value)]),
            ),
          );
        } else {
          newPropsNodes.push(
            j.objectProperty(j.identifier('queryParams'), j.objectExpression([prop])),
          );
        }
      }

      if (name === 'skipCache') {
        const cacheOptions = newPropsNodes.find((prop) => prop.key.name === 'cacheOptions');

        if (cacheOptions) {
          cacheOptions.value.properties.push(prop);
        } else {
          newPropsNodes.push(
            j.objectProperty(j.identifier('cacheOptions'), j.objectExpression([prop])),
          );
        }
      }
    }

    path.replace(j.objectExpression(newPropsNodes));
  });

  return root.toSource({
    quote: 'single',
    trailingComma: true,
  });
}

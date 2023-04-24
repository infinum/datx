import { API, FileInfo } from 'jscodeshift';

export const parser = 'ts';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const propertyDeclarations = root.find(j.PropertyDeclaration);

  // find all decorators on the class properties
  const decorators = propertyDeclarations.find(j.Decorator);

  console.log(decorators.length);

  return root.toSource();
}

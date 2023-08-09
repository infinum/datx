import { API, FileInfo } from 'jscodeshift';

export const parser = 'tsx';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.AwaitExpression).forEach((path) => {
    if (path.node.argument.type === 'MemberExpression') {
      const { name } = path.node.argument.property as any;

      if (name === 'next') {
        path.node.argument = j.optionalCallExpression(path.node.argument, []);
      }
    }
  });

  return root.toSource({
    quote: 'single',
    trailingComma: true,
  });
}

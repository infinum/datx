import { customScalar } from './customScalar';

export function plain<TType>() {
  return customScalar<TType, TType>(
    (instance) => instance,
    (plain) => plain,
  );
}

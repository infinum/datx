import { customScalar } from './customScalar';

export function plain<TType>(type: string) {
  return customScalar<TType, TType>(
    (instance) => instance,
    (plain) => plain,
    ((item) => typeof item === type) as any,
    ((item) => typeof item === type) as any,
    // TODO: Fix this
  );
}

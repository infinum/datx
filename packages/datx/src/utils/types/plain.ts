import { customScalar } from './customScalar';

export function plain<TType>(type: string) {
  return customScalar<TType, TType>(
    (instance) => instance,
    (plain) => plain,
    (item): item is TType => typeof item === type,
    (item): item is TType => typeof item === type,
  );
}

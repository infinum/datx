import { IJsonapiModel } from '@datx/jsonapi';
import { MutationFn } from "./types";

export function createMutation<TInput, TData extends IJsonapiModel>(mutationFn: MutationFn<TInput, TData>) {
  return mutationFn;
}

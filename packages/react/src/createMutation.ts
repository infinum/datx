import { IJsonapiModel } from '@datx/jsonapi';
import { MutationFn } from "./types";

export function createMutation<TData extends IJsonapiModel, TInput>(mutationFn: MutationFn<TData, TInput>) {
  return mutationFn;
}

import { BaseRequest } from '../BaseRequest';

export type IModelNetworkConfig =
  | BaseRequest
  | {
      getMany?: BaseRequest;
      getOne?: BaseRequest;
      create?: BaseRequest;
      update?: BaseRequest;
      destroy?: BaseRequest;
    };

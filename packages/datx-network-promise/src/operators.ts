import { CachingStrategy, IFetchOptions, IResponseObject, upsertInterceptor } from '@datx/network';
import { BaseRequest } from './BaseRequest';


export function fetchReference(fetchReference: typeof fetch) {
  return (pipeline: BaseRequest): void => {
    const config = pipeline['_config'];
    const fetchInterceptor = config.fetchInterceptor;
    config.fetchReference = fetchReference;
    if (fetchInterceptor) {
      upsertInterceptor(
        config.fetchInterceptor(
          config.fetchReference,
          config.serialize,
          config.parse,
          config.Response,
        ),
        'fetch',
      )(pipeline);
    }
  };
}

export function serializer(serialize: (request: IFetchOptions) => IFetchOptions) {
  return (pipeline: BaseRequest): void => {
    const config = pipeline['_config'];
    config.serialize = serialize;
    upsertInterceptor(
      config.fetchInterceptor(
        config.fetchReference,
        config.serialize,
        config.parse,
        config.Response,
      ),
      'fetch',
    )(pipeline);
  };
}

export function parser(parse: (data: Record<string, unknown>, response: IResponseObject) => Record<string, unknown>) {
  return (pipeline: BaseRequest): void => {
    const config = pipeline['_config'];
    config.parse = parse;
    upsertInterceptor(
      config.fetchInterceptor(
        config.fetchReference,
        config.serialize,
        config.parse,
        config.Response,
      ),
      'fetch',
    )(pipeline);
  };
}

export function cache<TResponseType>(
  strategy: CachingStrategy,
  maxAge = Infinity,
): (pipeline: BaseRequest) => void {
  return upsertInterceptor(cacheInterceptor(strategy, maxAge), 'cache');
}

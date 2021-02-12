

export function fetchReference(fetchReference: typeof fetch) {
  return (pipeline: BaseRequest): void => {
    const config = pipeline['_config'];
    config.fetchReference = fetchReference;
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
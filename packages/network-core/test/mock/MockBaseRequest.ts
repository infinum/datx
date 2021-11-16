import { PureModel } from '@datx/core';
import { Headers } from '@datx/utils';
import { BaseRequest, upsertInterceptor } from '../../src';
import { fetchInterceptor } from '../../src/interceptors/fetch';
import { IAsync } from '../../src/interfaces/IAsync';
import { PromiseNetwork } from '../../src/PromiseNetwork';

export class MockBaseRequest<
  TAsync extends IAsync = IAsync<any>,
  TModel extends PureModel = PureModel,
> extends BaseRequest<TAsync, TModel> {
  constructor(baseUrl: string) {
    super(baseUrl);
    this.resetMock({
      status: 200,
      headers: new Headers([['Content-Type', 'application/json']]),
      json: async () => [],
    });
  }

  protected resetMock(mockResponse: any, success = true): void {
    fetchReference(
      success
        ? jest.fn().mockResolvedValue(mockResponse)
        : jest.fn().mockRejectedValue(mockResponse),
    )(this);
  }

  private get lastRequest(): [
    string,
    { method: string; body: string | FormData | undefined; headers: Record<string, string> },
  ] {
    const mockFetch = (this['_config'].fetchReference as jest.Mock).mock.calls;
    return mockFetch[mockFetch.length - 1];
  }

  protected get lastMethod(): string {
    return this.lastRequest[1].method;
  }

  protected get lastUrl(): string {
    return this.lastRequest[0];
  }

  protected get lastBody(): string | FormData | undefined {
    return this.lastRequest[1].body;
  }

  protected get lastHeaders(): Record<string, string> {
    return this.lastRequest[1].headers;
  }
}

export function fetchReference(fetchReference: typeof fetch) {
  return (pipeline: MockBaseRequest): void => {
    const config = pipeline['_config'];
    config.fetchReference = fetchReference;
    const network = new PromiseNetwork('', config.fetchReference as any);
    upsertInterceptor(
      fetchInterceptor(network, config.serialize, config.parse, config.Response) as any,
      'fetch',
    )(pipeline as any);
  };
}

import { BaseRequest, fetchReference } from '../../src';
import { PureModel } from 'datx';

export class MockBaseRequest<T extends PureModel = PureModel> extends BaseRequest<T> {
  constructor(baseUrl: string) {
    super(baseUrl);
    this.resetMock({
      status: 200,
      json: async () => ({}),
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

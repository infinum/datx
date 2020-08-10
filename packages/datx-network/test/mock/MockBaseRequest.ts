import { BaseRequest } from '../../src';

export class MockBaseRequest extends BaseRequest {
  constructor(baseUrl: string) {
    super(baseUrl);
    this.resetMock({
      status: 200,
      json: async () => ({}),
    });
  }

  protected resetMock(mockResponse: any, success = true): void {
    this.config.fetchReference = success
      ? jest.fn().mockResolvedValue(mockResponse)
      : jest.fn().mockRejectedValue(mockResponse);
  }

  private get lastRequest(): [
    string,
    { method: string; body: string | FormData | undefined; headers: Record<string, string> },
  ] {
    const mockFetch = (this.config.fetchReference as jest.Mock).mock.calls;
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

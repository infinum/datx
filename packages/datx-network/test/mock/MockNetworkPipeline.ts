import { NetworkPipeline } from '../../src';

export class MockNetworkPipeline extends NetworkPipeline {
  protected baseFetch = jest.fn().mockResolvedValue(Promise.resolve({ status: 200 }));

  private get lastRequest(): [string, string, any, any] {
    return this.baseFetch.mock.calls[this.baseFetch.mock.calls.length - 1];
  }

  protected get lastMethod(): string {
    return this.lastRequest[0];
  }

  protected get lastUrl(): string {
    return this.lastRequest[1];
  }

  protected get lastBody(): any {
    return this.lastRequest[2];
  }

  protected get lastHeaders(): any {
    return this.lastRequest[3];
  }
}

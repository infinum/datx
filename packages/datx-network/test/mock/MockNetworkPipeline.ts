import { NetworkPipeline } from '../../src';

export class MockNetworkPipeline extends NetworkPipeline {
  protected baseFetch = jest.fn().mockResolvedValue(Promise.resolve({ status: 200 }));
}

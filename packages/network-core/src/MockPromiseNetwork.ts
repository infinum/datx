import { PromiseNetwork } from './PromiseNetwork';

type IAssertion = (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

export class MockPromiseNetwork extends PromiseNetwork {
  constructor() {
    const fetchReference = (input: RequestInfo, init?: RequestInit | undefined) => {
      if (!this.assertion) {
        throw new Error('No assertion defined');
      }
      const response = this.assertion(input, init);
      this.assertion = undefined;
      return response;
    };

    super(fetchReference);
  }

  private assertion?: IAssertion;

  public setAssertion(assertion: IAssertion): void {
    this.assertion = assertion;
  }
}

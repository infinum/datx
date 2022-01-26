import { PromiseNetwork } from './PromiseNetwork';

type IAssertion = (
  input: RequestInfo,
  init?: RequestInit | undefined,
) => Promise<[body?: Record<string, unknown> | null | undefined, init?: ResponseInit | undefined]>;

export class MockPromiseNetwork extends PromiseNetwork {
  constructor() {
    const fetchReference = async (input: RequestInfo, init?: RequestInit | undefined) => {
      const assertion = this.assertions.shift();
      if (!assertion) {
        throw new Error('No assertion defined');
      }
      const [bodyData, responseInit] = await assertion(input, init);
      return new Response(JSON.stringify(bodyData), responseInit);
    };

    super(fetchReference);
    this.assertions = [];
  }

  private assertions: Array<IAssertion>;

  public setAssertion(assertion: IAssertion): void {
    this.assertions.push(assertion);
  }
}

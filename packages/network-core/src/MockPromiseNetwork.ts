import { PromiseNetwork } from './PromiseNetwork';

type IAssertion = (
  input: RequestInfo,
  init?: RequestInit | undefined,
) => Promise<
  [
    body?: Array<Record<string, unknown>> | Record<string, unknown> | string | null | undefined,
    init?: ResponseInit | undefined,
  ]
>;

export class MockPromiseNetwork extends PromiseNetwork {
  constructor() {
    const fetchReference = async (input: RequestInfo, init?: RequestInit | undefined) => {
      const assertion = this.assertions.shift();
      if (!assertion) {
        throw new Error('No assertion defined');
      }
      const [bodyData, initData] = await assertion(input, init);
      const responseInit = { headers: { 'content-type': 'application/json' }, ...initData };
      return new Response(
        typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData),
        responseInit,
      );
    };

    super(fetchReference);
    this.assertions = [];
  }

  private assertions: Array<IAssertion>;

  public setAssertion(assertion: IAssertion): void {
    this.assertions.push(assertion);
  }

  public verify(): boolean {
    if (this.assertions.length === 0) {
      return true;
    }
    throw new Error('Not all assertions were called');
  }
}

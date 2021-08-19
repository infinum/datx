import { PromiseNetwork } from './PromiseNetwork';

type IAssertion = (
  input: RequestInfo,
  init?: RequestInit | undefined,
) => Promise<[body?: Record<string, unknown> | null | undefined, init?: ResponseInit | undefined]>;

export class MockPromiseNetwork extends PromiseNetwork {
  constructor() {
    const fetchReference = async (input: RequestInfo, init?: RequestInit | undefined) => {
      if (!this.assertion) {
        throw new Error('No assertion defined');
      }
      const [bodyData, responseInit] = await this.assertion(input, init);
      this.assertion = undefined;
      const body = new ReadableStream({
        async pull(controller) {
          controller.enqueue(JSON.stringify(bodyData));
          controller.close();
        },
      });
      return new Response(body, responseInit);
    };

    super(fetchReference);
  }

  private assertion?: IAssertion;

  public setAssertion(assertion: IAssertion): void {
    this.assertion = assertion;
  }
}

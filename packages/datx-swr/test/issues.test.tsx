import { config } from '@datx/jsonapi';
import { createFetcher } from '@datx/swr';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { createClient } from './datx';
import { renderWithConfig } from './utils';
import { SingleResponse, useMutation } from '../src';

describe('issues', () => {
  it('should use static endpoint for building an URL when fetching related resources', async () => {
    const client = createClient();
    const fetcher = createFetcher(client);

    const requestSpySingle = jest.spyOn(client, 'requestSingle');
    const requestSpyCollection = jest.spyOn(client, 'requestCollection');

    await fetcher({ op: 'getRelatedResource', type: 'withEndpoint', id: '1', relation: 'related' });

    expect(requestSpySingle).toBeCalledWith(
      expect.stringContaining('/with-endpoint/1/related'),
      undefined,
      undefined,
      expect.anything(),
    );

    await fetcher({
      op: 'getRelatedResources',
      type: 'withEndpoint',
      id: '2',
      relation: 'related',
    });

    expect(requestSpyCollection).toBeCalledWith(
      expect.stringContaining('/with-endpoint/2/related'),
      undefined,
      undefined,
      expect.anything(),
    );

    expect(requestSpySingle).toBeCalledTimes(1);
    expect(requestSpyCollection).toBeCalledTimes(1);
  });

  it('should not duplicate query params when relation query is used', async () => {
    const client = createClient();
    const fetcher = createFetcher(client);

    const fetchSpy = jest.spyOn(config, 'fetchReference');

    await fetcher({
      op: 'getRelatedResources',
      type: 'withEndpoint',
      id: '1',
      relation: 'related',
      queryParams: {
        custom: ['custom=1'],
      },
    });

    expect(fetchSpy).toBeCalledWith(expect.stringMatching('\\?custom=1$'), expect.anything());

    await fetcher({
      op: 'getRelatedResource',
      type: 'withEndpoint',
      id: '1',
      relation: 'related',
      queryParams: {
        custom: ['custom=1'],
      },
    });

    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.stringMatching('\\?custom=1$'),
      expect.anything(),
    );
  });

  it('should not allow to use client.request', async () => {
    const client = createClient();

    expect(() => client.request('test')).toThrowError();
  });

  it('should call updated callbacks on useMutation', async () => {
    const mockFn = jest.fn();
    const mockInlineFn = jest.fn();
    const mockMutate = jest.fn(() => {
      return Promise.resolve(new SingleResponse({ status: 200 }));
    });

    const UI = () => {
      const [shouldCall, setShouldCall] = useState(false);

      const [mutation] = useMutation(mockMutate, {
        onSuccess: () => {
          if (shouldCall) {
            mockFn();
          }
        },
      });

      return (
        <>
          <button onClick={() => setShouldCall((p) => !p)}>toggle-should-call</button>
          <button onClick={() => mutation({})}>mutate</button>
          <button
            onClick={() =>
              mutation(
                {},
                {
                  onSuccess: () => {
                    if (shouldCall) {
                      mockInlineFn();
                    }
                  },
                },
              )
            }
          >
            mutate-inline
          </button>
        </>
      );
    };

    renderWithConfig(<UI />);

    const user = userEvent.setup();

    const mutateButton = screen.getByText('mutate');
    const mutateInlineButton = screen.getByText('mutate-inline');
    const toggleShouldCallButton = screen.getByText('toggle-should-call');

    await user.click(mutateButton);
    expect(mockFn).not.toBeCalled();
    await user.click(mutateInlineButton);
    expect(mockInlineFn).not.toBeCalled();

    await user.click(toggleShouldCallButton);

    await user.click(mutateButton);
    expect(mockFn).toBeCalled();

    await user.click(mutateInlineButton);
    expect(mockFn).toBeCalledTimes(2);
    expect(mockInlineFn).toBeCalled();

    await user.click(toggleShouldCallButton);

    await user.click(mutateButton);
    expect(mockFn).toBeCalledTimes(2);

    await user.click(mutateInlineButton);
    expect(mockFn).toBeCalledTimes(2);
    expect(mockInlineFn).toBeCalledTimes(1);
  });
});

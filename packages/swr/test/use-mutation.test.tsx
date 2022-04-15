import React, { FC } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useMutation } from '../src';
import { renderWithConfig } from './utils';
import { createClient } from './datx';

interface ITesterProps {
  mutationFn: () => Promise<any>;
  onMutate: () => any;
  onSuccess: () => any;
  onFailure: () => any;
  onSettled: () => any;
}

const Tester: FC<ITesterProps> = ({ mutationFn, onMutate, onSuccess, onFailure, onSettled }) => {
  const [mutate, { status }] = useMutation(mutationFn, {
    onMutate,
    onSuccess,
    onFailure,
    onSettled,
  });

  return <button onClick={() => mutate('test-1')}>{status}</button>;
};

// TODO fix tests
describe.skip('useMutation', () => {
  test('should call all the correct function for a successful mutation', async () => {
    const mutationFn = jest.fn(() => Promise.resolve('result-1'));
    const onMutate = jest.fn();
    const onSuccess = jest.fn();
    const onFailure = jest.fn();
    const onSettled = jest.fn();

    const client = createClient();

    renderWithConfig(
      <Tester
        mutationFn={mutationFn}
        onMutate={onMutate}
        onSuccess={onSuccess}
        onFailure={onFailure}
        onSettled={onSettled}
      />,
    );

    userEvent.click(screen.getByRole('button'));

    await screen.findByText('running');

    expect(mutationFn).toHaveBeenCalledWith(client, 'test-1');
    expect(onMutate).toHaveBeenCalledWith({ input: 'test-1' });
    expect(onSuccess).toHaveBeenCalledWith({
      data: 'result-1',
      input: 'test-1',
    });
    expect(onFailure).not.toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalledWith({
      status: 'success',
      data: 'result-1',
      input: 'test-1',
    });
  });

  test('should call all the correct function for a failure mutation', async () => {
    const noop = jest.fn();
    const mutationFn = jest.fn(() => Promise.reject('reason-1'));
    const onMutate = jest.fn(() => noop);
    const onSuccess = jest.fn();
    const onFailure = jest.fn();
    const onSettled = jest.fn();

    const client = createClient();

    renderWithConfig(
      <Tester
        mutationFn={mutationFn}
        onMutate={onMutate}
        onSuccess={onSuccess}
        onFailure={onFailure}
        onSettled={onSettled}
      />,
    );

    userEvent.click(screen.getByRole('button'));

    await screen.findByText('running');

    expect(mutationFn).toHaveBeenCalledWith(client, 'test-1');
    expect(onMutate).toHaveBeenCalledWith({ input: 'test-1' });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledWith({
      error: 'reason-1',
      rollback: noop,
      input: 'test-1',
    });
    expect(onSettled).toHaveBeenCalledWith({
      status: 'failure',
      error: 'reason-1',
      input: 'test-1',
      rollback: noop,
    });
  });
});

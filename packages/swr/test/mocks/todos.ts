import { rest } from 'msw';
import { BASE_URL } from '../constants';

export const todosErrorDetails = 'Not authorized on Sundays.';
export const todosError = rest.get(`${BASE_URL}todos`, (_, res, ctx) =>
  res(
    ctx.status(403),
    ctx.json({
      errors: [
        {
          status: '403',
          detail: todosErrorDetails,
        },
      ],
    }),
  ),
);

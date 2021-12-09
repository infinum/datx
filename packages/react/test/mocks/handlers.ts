import { rest } from 'msw';
import { BASE_URL } from '../constants';

export const message = 'JSON:API paints my bikeshed!';

export const handlers = [
  rest.get(`${BASE_URL}todos`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            type: 'todos',
            id: '1',
            attributes: {
              message,
            },
          },
        ],
      }),
    );
  }),
];

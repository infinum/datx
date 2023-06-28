import { rest } from 'msw';
import { BASE_URL } from '../constants';

export const message = 'JSON:API paints my bikeshed!';

export const todoResource = {
  type: 'todos',
  id: '1',
  attributes: {
    message,
  },
};

export const name = 'John Doe';

export const personResource = {
  type: 'persons',
  id: '1',
  attributes: {
    name,
  },
};

export const jsonApiRawWrapper = (data) => ({ data });

export const handlers = [
  rest.get(`${BASE_URL}todo-lists/:id/todos`, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(jsonApiRawWrapper([todoResource])));
  }),
  rest.get(`${BASE_URL}todos`, (req, res, ctx) => {
    const pageIndex = parseInt(req.url.searchParams.get('page[index]') ?? '0');

    if (pageIndex >= 1) {
      return res(ctx.status(200), ctx.json(jsonApiRawWrapper([])));
    }

    return res(ctx.status(200), ctx.json(jsonApiRawWrapper([todoResource])));
  }),
  rest.get(`${BASE_URL}todos/1`, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(jsonApiRawWrapper(todoResource)));
  }),
  rest.get(`${BASE_URL}todos/:id/author`, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(jsonApiRawWrapper(personResource)));
  }),
  rest.get(`${BASE_URL}todo-lists/:id/author`, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(jsonApiRawWrapper(personResource)));
  }),
  rest.get(`${BASE_URL}with-endpoint/:id/:relation`, (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(jsonApiRawWrapper(personResource)));
  }),
];

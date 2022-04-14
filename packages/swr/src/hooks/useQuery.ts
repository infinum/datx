import { Response } from '@datx/jsonapi';
import useSWR from 'swr';

import { Expression } from '../interfaces/QueryExpression';
import { DatxConfiguration } from '../interfaces/DatxConfiguration';
import { middleware } from '../middleware';
import { Data, Model } from '../interfaces/UserQuery';

export function useQuery(
  expression: Expression,
  config?: DatxConfiguration<Model<typeof expression>, Data<typeof expression>>,
) {
  return useSWR<
    Response<Model<typeof expression>, Data<typeof expression>>,
    Response<Model<typeof expression>, Data<typeof expression>>
  >(expression, {
    ...config,
    use: [middleware, ...(config?.use || [])],
  });
}

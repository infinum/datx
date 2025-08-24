import { IModelConstructor, PureModel } from '@datx/core';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 } from 'uuid';

import { db } from './db';
import { serializeMany, serializeOne, Record, serializeErrors } from './serializer';

const findModel = (type: string) => (model: IModelConstructor<PureModel>) => model.type === type;
const findRecord = (id: string) => (record: Record) => record.id === id;

interface IHandlerSettings {
  types: Array<IModelConstructor<PureModel>>;
}

export const createHandler =
  ({ types }: IHandlerSettings) =>
  (req: NextApiRequest, res: NextApiResponse) => {
    const {
      query: { slug },
    } = req;

    const [type, id] = slug as Array<string>;

    const Model = types.find(findModel(type));

    if (Model) {
      let records = db.get(type);

      if (id) {
        const record = records.find((item: Record) => item.id === id);

        res.status(200).json(serializeOne(record, type));
        return;
      }

      if (req.method === 'POST') {
        const id = v4();
        const {
          data: { attributes },
        } = JSON.parse(req.body);
        const record = db
          .set(type, [...records, { id, ...(attributes || {}) }])
          .get(type)
          .find(findRecord(id));

        res.status(201).json(serializeOne(record, type));
        return;
      }

      res.status(200).json(serializeMany(records, type));
      return;
    }

    res.status(404).json(serializeErrors([{ status: 404, title: 'Not Found ' }]));
  };

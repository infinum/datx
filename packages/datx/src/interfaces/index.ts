/* eslint-disable @typescript-eslint/no-unused-vars */

import { OneOf } from '../utils/types/oneOf';
import { BooleanType, DateType, NumberType, StringType } from '../utils/types/primitive';
import { ArrayOf } from '../utils/types/arrayOf';
import { Schema } from '../utils/types/schema';
import { lazySchema } from '../utils/helpers';

const locationSchema = new Schema(
  {
    lat: NumberType,
    lng: NumberType,
    name: StringType.optional(),
    date: DateType.optional().default(new Date()),
  },
  'location',
);

const loc = locationSchema.parse({
  lat: 1,
  lng: 2,
  name: 'test',
});

const beeingSchema = new Schema(
  {
    name: StringType,
    age: NumberType.optional(),
    isHuman: BooleanType.optional().default(true),
    dob: DateType.optional(),
    type: OneOf(StringType, NumberType),
    hobbies: ArrayOf(StringType),
    location: locationSchema,
    oldLocation: locationSchema.optional(),
  },
  'beeing',
);

const b = beeingSchema.parse({
  name: 'flipper',
  isHuman: false,
  type: 'dolphin',
  hobbies: ['swimming'],
  location: {
    lat: 1,
    lng: 2,
  },
  oldLocation: {
    lat: 1,
    lng: 2,
  },
});
// @ts-expect-error - Age must be a number
const wrong = beeingSchema.parse({ name: '123', age: '123' });

b.name = '123';
// @ts-expect-error - Age must be a number
b.age = '123';
b.isHuman = false;
// @ts-expect-error - Arrays are not supported
b.name = ['123'];

const lat = b.location?.lat;

const c = beeingSchema.serialize(b);

c.name = '1';
// @ts-expect-error - Age must be a number
c.age = '1';

///////

console.log(wrong, lat, loc, b);

const ModelA = new Schema(
  {
    name: StringType,
    // modelB: lazySchema(() => ModelB),
  },
  'modelA',
);

const ModelB = new Schema(
  {
    name: StringType,
    modelA: lazySchema(() => ModelA),
  },
  'modelB',
);

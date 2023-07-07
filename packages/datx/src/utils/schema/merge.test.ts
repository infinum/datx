import { IResource } from '../../interfaces/IResource';
import { Schema } from '../../Schema';
import { mergeSchema } from './merge';
import { String, Number } from '../../type';

describe('merge', () => {
  it('should do basic merging', () => {
    const Foo = new Schema(
      'foo',
      {
        name: String,
        age: Number,
      },
      (data: IResource<Schema>) => `foo/${data.name}`,
    );

    const target = {
      name: 'Foo',
    };

    const source = {
      age: 10,
    };

    const merged = mergeSchema(Foo, target, source);

    expect(merged).toEqual({ name: 'Foo', age: 10 });
    expect(target).toEqual({ name: 'Foo' });
  });

  it('should do merging with same props', () => {
    const Foo = new Schema(
      'foo',
      {
        name: String,
        age: Number,
      },
      (data: IResource<Schema>) => `foo/${data.name}`,
    );

    const target = {
      name: 'Foo',
    };

    const source = {
      name: 'Bar',
      age: 10,
    };

    const merged = mergeSchema(Foo, target, source);

    expect(merged).toEqual({ name: 'Bar', age: 10 });
    expect(target).toEqual({ name: 'Foo' });
  });
});

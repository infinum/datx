export interface Record {
  id: string;
}

export function serializeRecord<T extends Record = Record>(data: T, type: string) {
  if (!data) {
      return undefined;
  }

  const { id, ...attributes } = data;

  return {
    id,
    type,
    attributes
  }
}

export function serializeOne<T extends Record = Record>(data: T, type: string) {
  return {
    data: serializeRecord(data, type) || null,
  }
}

export function serializeMany<T extends Record = Record>(data: Array<T>, type: string) {
  return {
    data: data?.map((record) => serializeRecord(record, type)) || null
  }
}

interface IJsonApiError {
  status: number;
  title: string;
}

export function serializeError({ status, title }: IJsonApiError) {
  return {
    status,
    title
  }
}

export function serializeErrors(errors: Array<IJsonApiError>) {
  return {
    errors
  };
}

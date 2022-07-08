import { ISchemaData } from '../interfaces/ISchemaData';
import { TResourceProp } from '../interfaces/TResourceProp';
export declare function mapObjectValues<T extends ISchemaData, TReturn = TResourceProp<T[keyof T], true>>(obj: T, fn: (key: keyof T, value: typeof obj[typeof key]) => TReturn): TReturn;

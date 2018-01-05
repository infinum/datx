import { Model } from './Model';
declare const _default: (<T extends Model>(obj: T, key: string) => void) & {
    defaultValue(value: any): <T extends Model>(obj: T, key: string) => void;
    toOne(refModel: typeof Model): <T extends Model>(obj: T, key: string) => void;
    toMany(refModel: typeof Model, property?: string | undefined): <T extends Model>(obj: T, key: string) => void;
    toOneOrMany(refModel: typeof Model): <T extends Model>(obj: T, key: string) => void;
    identifier<T extends Model>(obj: T, key: string): void;
    type<T extends Model>(obj: T, key: string): void;
};
export default _default;

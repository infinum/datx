import { Schema } from '../Schema';
import { ICustomScalar } from './ICustomScalar';
import { IResource } from './IResource';
import { IConstructor } from './IConstructor';
import { TResourceTypes } from './TResourceTypes';
export declare type TResourceProp<TProp extends TResourceTypes, TPlain extends boolean> = TProp extends Schema ? IResource<TProp, TPlain> : TProp extends Array<infer TInnerProp> ? TInnerProp extends TResourceTypes ? Array<TResourceProp<TInnerProp, TPlain>> : never : TProp extends {
    type: infer TInnerProp;
    optional: true;
    defaultValue?: any;
} ? TInnerProp extends TResourceTypes ? TResourceProp<TInnerProp, TPlain> | undefined : never : TProp extends {
    type: infer TInnerProp;
    optional?: false;
    defaultValue?: any;
} ? TInnerProp extends TResourceTypes ? TResourceProp<TInnerProp, TPlain> : never : TProp extends ICustomScalar<infer TInnerProp, infer TPlainProp> ? TPlain extends true ? TProp['optional'] extends true ? TPlainProp | undefined : TPlainProp : TProp['optional'] extends true ? TInnerProp | undefined : TInnerProp : TProp extends IConstructor ? InstanceType<TProp> : never;

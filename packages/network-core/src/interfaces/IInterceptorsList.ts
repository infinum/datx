import { IFinalInterceptor } from './IFinalInterceptor';
import { IInterceptor } from './IInterceptor';

interface IInterceptorObject<TInterceptor> {
  name: string;
  fn: TInterceptor;
}

export type IInterceptorsList<TResponseType> = Array<
  IInterceptorObject<IInterceptor<TResponseType> | IFinalInterceptor>
>;

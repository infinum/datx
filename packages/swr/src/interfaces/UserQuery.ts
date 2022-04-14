import { IJsonapiModel } from '@datx/jsonapi';
import { ExactExpressionArgument, Expression, FindModel } from './QueryExpression';

export type Model<TExpression extends Expression> = FindModel<
  ExactExpressionArgument<TExpression>['type']
>;

export type Data<
  TExpression extends Expression,
  TModel extends IJsonapiModel = Model<TExpression>,
> = ExactExpressionArgument<TExpression> extends { readonly op: 'getOne' } ? TModel : Array<TModel>;

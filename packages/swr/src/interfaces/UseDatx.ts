import { IJsonapiModel } from '@datx/jsonapi';
import { ExactExpressionArgument, Expression, FindModel } from './QueryExpression';

export type Model<TExpression extends Expression> = FindModel<
  ExactExpressionArgument<TExpression>['type']
>;

// export type Relation<TExpression extends Expression> =
//   ExactExpressionArgument<TExpression> extends { readonly op: 'getRelatedResource' }
//     ? FindModel<ExactExpressionArgument<TExpression>['relation']>
//     : ExactExpressionArgument<TExpression> extends { readonly op: 'getRelatedResources' }
//     ? FindModel<ExactExpressionArgument<TExpression>['relation']>
//     : never;

export type Data<
  TExpression extends Expression,
  TModel extends IJsonapiModel = Model<TExpression>,
> = ExactExpressionArgument<TExpression> extends { readonly op: 'getOne' } ? TModel : Array<TModel>;

// export type Data<
//   TExpression extends Expression,
//   TModel extends IJsonapiModel = Model<TExpression>,
//   // TRelationModel extends IJsonapiModel = Relation<TExpression>,
// > = ExactExpressionArgument<TExpression> extends { readonly op: 'getOne' }
//   ? TModel
//   : ExactExpressionArgument<TExpression> extends { readonly op: 'getRelatedResource' }
//   ? TModel[ExactExpressionArgument<TExpression>['relation']]
//   : ExactExpressionArgument<TExpression> extends { readonly op: 'getRelatedResources' }
//   ? Array<TModel[ExactExpressionArgument<TExpression>['relation']]>
//   : Array<TModel>;

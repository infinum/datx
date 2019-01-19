import { IDictionary, META_FIELD } from 'datx-utils';

import { IIdentifier } from './interfaces/IIdentifier';
import { IType } from './interfaces/IType';
import { withActions } from './mixins/withActions';
import { withMeta } from './mixins/withMeta';
import { withPatches } from './mixins/withPatches';
import { PureModel } from './PureModel';

export class Model extends withPatches(withActions(withMeta(PureModel))) {
  public valueOf(): IDictionary & { meta: { id: IIdentifier; type: IType } } {
    const raw: IDictionary = this.meta.snapshot;
    // tslint:disable-next-line:no-dynamic-delete
    delete raw[META_FIELD];

    return {
      ...raw,
      meta: {
        id: this.meta.id,
        type: this.meta.type,
      },
    };
  }

  public toString() {
    return JSON.stringify(this.valueOf(), null, 2);
  }

}

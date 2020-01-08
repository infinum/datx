import { META_FIELD } from 'datx-utils';

import { PureModel } from './PureModel';
import { withMeta } from './mixins/withMeta';
import { withActions } from './mixins/withActions';
import { IModelRef } from './interfaces/IModelRef';
import { withPatches } from './mixins/withPatches';

export class Model extends withPatches(withActions(withMeta(PureModel))) {
  public valueOf(): Record<string, any> & { meta: IModelRef } {
    const raw: Record<string, any> = this.meta.snapshot;
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

import {withPatches} from './mixins/withPatches';
import {Model} from './Model';
import {PureCollection} from './PureCollection';
import {PureModel} from './PureModel';

export class Collection extends withPatches(PureCollection) {
  public static defaultModel?: typeof PureModel = Model;
}

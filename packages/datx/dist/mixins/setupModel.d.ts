import { IDictionary } from '../interfaces/IDictionary';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { IReferenceOptions } from '../interfaces/IReferenceOptions';
import { IType } from '../interfaces/IType';
import { Model } from '../Model';
export declare function setupModel<IModel extends Model, IFields extends IDictionary<any>>(Base: IModelConstructor<IModel>, {fields, references, type, idAttribute, typeAttribute}?: {
    fields: IFields;
    references?: IDictionary<IReferenceOptions>;
    type?: IType;
    idAttribute?: string;
    typeAttribute?: string;
}): IModelConstructor<IModel & IFields>;

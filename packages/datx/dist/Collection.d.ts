import { IDictionary } from './interfaces/IDictionary';
import { IIdentifier } from './interfaces/IIdentifier';
import { IModelConstructor } from './interfaces/IModelConstructor';
import { IRawModel } from './interfaces/IRawModel';
import { IType } from './interfaces/IType';
import { TFilterFn } from './interfaces/TFilterFn';
import { Model } from './Model';
export declare class Collection {
    /**
     * List of models available in the collection
     *
     * @static
     * @type {Array<typeof Model>}
     * @memberof Collection
     */
    static types: Array<typeof Model>;
    private __data;
    private __initialized;
    private __dataMap;
    private __dataList;
    constructor(data?: Array<IRawModel>);
    /**
     * Function for inserting raw models into the collection. Used when hydrating the collection
     *
     * @param {Array<IRawModel>} data Raw model data
     * @returns {Array<Model>} A list of initialized models
     * @memberof Collection
     */
    insert(data: Array<IRawModel>): Array<Model>;
    /**
     * Add an existing model to the collection
     *
     * @template T
     * @param {T} data Model to be added
     * @returns {T} Added model
     * @memberof Collection
     */
    add<T extends Model>(data: T): T;
    /**
     * Add an array of existing models to the collection
     *
     * @template T
     * @param {Array<T>} data Array of models to be added
     * @returns {Array<T>} Added models
     * @memberof Collection
     */
    add<T extends Model>(data: Array<T>): Array<T>;
    /**
     * Add a new model to the collection
     *
     * @template T
     * @param {(IRawModel|IDictionary<any>)} data New data to be added
     * @param {(IType|IModelConstructor<T>)} model Model type to be added
     * @returns {T} Added model
     * @memberof Collection
     */
    add<T extends Model>(data: IRawModel | IDictionary<any>, model: IType | IModelConstructor<T>): T;
    /**
     * Add an array of new models to the collection
     *
     * @template T
     * @param {Array<IRawModel|IDictionary<any>>} data Array of new data to be added
     * @param {(IType|IModelConstructor<T>)} model Model type to be added
     * @returns {Array<T>} Added models
     * @memberof Collection
     */
    add<T extends Model>(data: Array<IRawModel | IDictionary<any>>, model: IType | IModelConstructor<T>): Array<T>;
    /**
     * Find a model based on the defined type and (optional) identifier
     *
     * @param {(IType|typeof Model|Model)} type Model type
     * @param {IIdentifier} [id] Model identifier
     * @returns {(Model|null)} The first matching model
     * @memberof Collection
     */
    find(type: IType | typeof Model | Model, id?: IIdentifier): Model | null;
    /**
     * Find a model based on a matching function
     *
     * @param {TFilterFn} test Function used to match the model
     * @returns {(Model|null)} The first matching model
     * @memberof Collection
     */
    find(test: TFilterFn): Model | null;
    /**
     * Filter models based on a matching function
     *
     * @param {TFilterFn} test Function used to match the models
     * @returns {(Model|null)} The matching models
     * @memberof Collection
     */
    filter(test: TFilterFn): Array<Model>;
    /**
     * Find all matching models or all models if no type is given
     *
     * @param {(IType|typeof Model)} [model] Model type to select
     * @returns {Array<Model>} List of matching models
     * @memberof Collection
     */
    findAll(model?: IType | typeof Model): Array<Model>;
    /**
     * Check if a model is in the collection
     *
     * @param {Model} model Model to check
     * @returns {boolean} The given model is in the collection
     * @memberof Collection
     */
    hasItem(model: Model): boolean;
    /**
     * Remove the first model based on the type and (optional) identifier
     *
     * @param {(IType|typeof Model)} type Model type
     * @param {IIdentifier} [id] Model identifier
     * @memberof Collection
     */
    remove(type: IType | typeof Model, id?: IIdentifier): any;
    /**
     * Remove the given model from the collection
     *
     * @param {Model} model Model to be removed from the collection
     * @memberof Collection
     */
    remove(model: Model): any;
    /**
     * A total count of models in the collection
     *
     * @readonly
     * @type {number}
     * @memberof Collection
     */
    readonly length: number;
    /**
     * Get the serializable value of the collection
     *
     * @returns {Array<IRawModel>} Pure JS value of the collection
     * @memberof Collection
     */
    toJSON(): Array<IRawModel>;
    /**
     * Destroy the collection and clean up all references
     *
     * @memberof Collection
     */
    destroy(): void;
    /**
     * Reset the collection (remove all models)
     *
     * @memberof Collection
     */
    reset(): void;
    private __confirmValid();
    private __addArray<T>(data);
    private __addArray<T>(data, model?);
    private __addSingle<T>(data);
    private __addSingle<T>(data, model?);
    private __insertModel(model, type?, id?);
    private __removeModel(model, type?, id?);
    private __findByType(model, id?);
    private __changeModelId(oldId, newId, type);
}

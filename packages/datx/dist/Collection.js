"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var errors_1 = require("./errors");
var collection_1 = require("./helpers/collection");
var format_1 = require("./helpers/format");
var utils_1 = require("./helpers/model/utils");
var Model_1 = require("./Model");
var storage_1 = require("./services/storage");
var Collection = /** @class */ (function () {
    function Collection(data) {
        if (data === void 0) { data = []; }
        this.__data = mobx_1.observable.shallowArray([]);
        this.__initialized = true;
        this.__dataMap = {};
        this.__dataList = {};
        this.insert(data);
        storage_1.storage.registerCollection(this);
    }
    /**
     * Function for inserting raw models into the collection. Used when hydrating the collection
     *
     * @param {Array<IRawModel>} data Raw model data
     * @returns {Array<Model>} A list of initialized models
     * @memberof Collection
     */
    Collection.prototype.insert = function (data) {
        this.__confirmValid();
        var models = collection_1.initModels(this, data);
        this.__insertModel(models);
        return models;
    };
    Collection.prototype.add = function (data, model) {
        this.__confirmValid();
        return (data instanceof Array) ? this.__addArray(data, model) : this.__addSingle(data, model);
    };
    Collection.prototype.find = function (model, id) {
        return collection_1.isSelectorFunction(model)
            ? this.__data.find(model)
            : this.__findByType(model, id);
    };
    /**
     * Filter models based on a matching function
     *
     * @param {TFilterFn} test Function used to match the models
     * @returns {(Model|null)} The matching models
     * @memberof Collection
     */
    Collection.prototype.filter = function (test) {
        return this.__data.filter(test);
    };
    /**
     * Find all matching models or all models if no type is given
     *
     * @param {(IType|typeof Model)} [model] Model type to select
     * @returns {Array<Model>} List of matching models
     * @memberof Collection
     */
    Collection.prototype.findAll = function (model) {
        if (model) {
            var type = utils_1.getModelType(model);
            return this.__dataList[type] || [];
        }
        return this.__data;
    };
    /**
     * Check if a model is in the collection
     *
     * @param {Model} model Model to check
     * @returns {boolean} The given model is in the collection
     * @memberof Collection
     */
    Collection.prototype.hasItem = function (model) {
        var type = utils_1.getModelType(model);
        var id = utils_1.getModelId(model);
        return type in this.__dataMap && id in this.__dataMap[type];
    };
    Collection.prototype.remove = function (obj, id) {
        this.__confirmValid();
        var model = typeof obj === 'object' ? obj : this.find(obj, id);
        if (model) {
            this.__removeModel(model);
        }
    };
    Object.defineProperty(Collection.prototype, "length", {
        /**
         * A total count of models in the collection
         *
         * @readonly
         * @type {number}
         * @memberof Collection
         */
        get: function () {
            return this.__data.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the serializable value of the collection
     *
     * @returns {Array<IRawModel>} Pure JS value of the collection
     * @memberof Collection
     */
    Collection.prototype.toJSON = function () {
        return this.__data.map(utils_1.modelToJSON);
    };
    /**
     * Destroy the collection and clean up all references
     *
     * @memberof Collection
     */
    Collection.prototype.destroy = function () {
        this.__confirmValid();
        storage_1.storage.unregisterCollection(this);
        this.__initialized = false;
    };
    /**
     * Reset the collection (remove all models)
     *
     * @memberof Collection
     */
    Collection.prototype.reset = function () {
        var _this = this;
        this.__confirmValid();
        this.__data.replace([]);
        var types = Object.keys(this.__dataList);
        types.forEach(function (type) {
            delete _this.__dataList[type];
            delete _this.__dataMap[type];
        });
    };
    Collection.prototype.__confirmValid = function () {
        if (!this.__initialized) {
            throw format_1.error(errors_1.COLLECTION_DESTROYED);
        }
    };
    Collection.prototype.__addArray = function (data, model) {
        var _this = this;
        return data.filter(Boolean).map(function (item) { return _this.__addSingle(item, model); });
    };
    Collection.prototype.__addSingle = function (data, model) {
        if (!data) {
            return data;
        }
        if (data instanceof Model_1.Model) {
            if (!this.hasItem(data)) {
                this.__insertModel(data);
            }
            return data;
        }
        if (!model) {
            throw format_1.error(errors_1.UNDEFINED_TYPE);
        }
        var type = utils_1.getModelType(model);
        var modelInstance = collection_1.upsertModel(data, type, this);
        this.__insertModel(modelInstance, type);
        var id = utils_1.getModelId(modelInstance);
        return modelInstance;
    };
    Collection.prototype.__insertModel = function (model, type, id) {
        var _this = this;
        if (model instanceof Array) {
            return model.forEach(function (item) { return _this.__insertModel(item, type, id); });
        }
        var modelType = type || utils_1.getModelType(model);
        var modelId = id || utils_1.getModelId(model);
        this.__data.push(model);
        this.__dataList[modelType] = this.__dataList[modelType] || mobx_1.observable.shallowArray([]);
        this.__dataList[modelType].push(model);
        this.__dataMap[modelType] = this.__dataMap[modelType] || mobx_1.observable.shallowObject({});
        this.__dataMap[modelType][modelId] = model;
    };
    Collection.prototype.__removeModel = function (model, type, id) {
        var _this = this;
        if (model instanceof Array) {
            return model.forEach(function (item) { return _this.__removeModel(item, type, id); });
        }
        var modelType = type || utils_1.getModelType(model);
        var modelId = id || utils_1.getModelId(model);
        this.__data.remove(model);
        this.__dataList[modelType].remove(model);
        delete this.__dataMap[modelType][modelId];
    };
    Collection.prototype.__findByType = function (model, id) {
        var type = utils_1.getModelType(model);
        if (id) {
            var models = this.__dataMap[type] || {};
            // console.log('Find by type', type, id, Object.keys(models))
            return models[id] || null;
        }
        else {
            var data = this.__dataList[type] || [];
            return data[0] || null;
        }
    };
    Collection.prototype.__changeModelId = function (oldId, newId, type) {
        this.__dataMap[type][newId] = this.__dataMap[type][oldId];
        delete this.__dataMap[type][oldId];
    };
    /**
     * List of models available in the collection
     *
     * @static
     * @type {Array<typeof Model>}
     * @memberof Collection
     */
    Collection.types = [];
    __decorate([
        mobx_1.observable
    ], Collection.prototype, "__dataMap", void 0);
    __decorate([
        mobx_1.observable
    ], Collection.prototype, "__dataList", void 0);
    __decorate([
        mobx_1.computed
    ], Collection.prototype, "length", null);
    return Collection;
}());
exports.Collection = Collection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Db2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsNkJBQTREO0FBRTVELG1DQUErRTtBQUMvRSxtREFBaUY7QUFDakYsMkNBQXVDO0FBQ3ZDLCtDQUF5RjtBQU96RixpQ0FBOEI7QUFDOUIsOENBQTJDO0FBRTNDO0lBaUJFLG9CQUFZLElBQTJCO1FBQTNCLHFCQUFBLEVBQUEsU0FBMkI7UUFOL0IsV0FBTSxHQUE0QixpQkFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5RCxrQkFBYSxHQUFZLElBQUksQ0FBQztRQUVsQixjQUFTLEdBQW9DLEVBQUUsQ0FBQztRQUNoRCxlQUFVLEdBQXlDLEVBQUUsQ0FBQztRQUd4RSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLGlCQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLDJCQUFNLEdBQWIsVUFBYyxJQUFzQjtRQUNsQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBTSxNQUFNLEdBQUcsdUJBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQixNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUE0Q00sd0JBQUcsR0FBVixVQUNFLElBQXFGLEVBQ3JGLEtBQStCO1FBRS9CLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixNQUFNLENBQUMsQ0FBQyxJQUFJLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUks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SSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO1FBQ3pCLENBQUM7SUFDSCxDQUFDO0lBRU8sb0NBQWUsR0FBdkIsVUFBd0IsS0FBa0IsRUFBRSxLQUFrQixFQUFFLElBQVc7UUFDekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBOVNEOzs7Ozs7T0FNRztJQUNXLGdCQUFLLEdBQXdCLEVBQUUsQ0FBQztJQUtsQztRQUFYLGlCQUFVO2lEQUF5RDtJQUN4RDtRQUFYLGlCQUFVO2tEQUErRDtJQXVLaEU7UUFBVCxlQUFROzRDQUVSO0lBeUhILGlCQUFDO0NBQUEsQUFqVEQsSUFpVEM7QUFqVFksZ0NBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvbXB1dGVkLCBJT2JzZXJ2YWJsZUFycmF5LCBvYnNlcnZhYmxlfSBmcm9tICdtb2J4JztcblxuaW1wb3J0IHtDT0xMRUNUSU9OX0RFU1RST1lFRCwgVU5ERUZJTkVEX01PREVMLCBVTkRFRklORURfVFlQRX0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHtpbml0TW9kZWxzLCBpc1NlbGVjdG9yRnVuY3Rpb24sIHVwc2VydE1vZGVsfSBmcm9tICcuL2hlbHBlcnMvY29sbGVjdGlvbic7XG5pbXBvcnQge2Vycm9yfSBmcm9tICcuL2hlbHBlcnMvZm9ybWF0JztcbmltcG9ydCB7Z2V0TW9kZWxJZCwgZ2V0TW9kZWxUeXBlLCBtb2RlbFRvSlNPTiwgdXBkYXRlTW9kZWx9IGZyb20gJy4vaGVscGVycy9tb2RlbC91dGlscyc7XG5pbXBvcnQge0lEaWN0aW9uYXJ5fSBmcm9tICcuL2ludGVyZmFjZXMvSURpY3Rpb25hcnknO1xuaW1wb3J0IHtJSWRlbnRpZmllcn0gZnJvbSAnLi9pbnRlcmZhY2VzL0lJZGVudGlmaWVyJztcbmltcG9ydCB7SU1vZGVsQ29uc3RydWN0b3J9IGZyb20gJy4vaW50ZXJmYWNlcy9JTW9kZWxDb25zdHJ1Y3Rvcic7XG5pbXBvcnQge0lSYXdNb2RlbH0gZnJvbSAnLi9pbnRlcmZhY2VzL0lSYXdNb2RlbCc7XG5pbXBvcnQge0lUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvSVR5cGUnO1xuaW1wb3J0IHtURmlsdGVyRm59IGZyb20gJy4vaW50ZXJmYWNlcy9URmlsdGVyRm4nO1xuaW1wb3J0IHtNb2RlbH0gZnJvbSAnLi9Nb2RlbCc7XG5pbXBvcnQge3N0b3JhZ2V9IGZyb20gJy4vc2VydmljZXMvc3RvcmFnZSc7XG5cbmV4cG9ydCBjbGFzcyBDb2xsZWN0aW9uIHtcblxuICAvKipcbiAgICogTGlzdCBvZiBtb2RlbHMgYXZhaWxhYmxlIGluIHRoZSBjb2xsZWN0aW9uXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQHR5cGUge0FycmF5PHR5cGVvZiBNb2RlbD59XG4gICAqIEBtZW1iZXJvZiBDb2xsZWN0aW9uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHR5cGVzOiBBcnJheTx0eXBlb2YgTW9kZWw+ID0gW107XG5cbiAgcHJpdmF0ZSBfX2RhdGE6IElPYnNlcnZhYmxlQXJyYXk8TW9kZWw+ID0gb2JzZXJ2YWJsZS5zaGFsbG93QXJyYXkoW10pO1xuICBwcml2YXRlIF9faW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIEBvYnNlcnZhYmxlIHByaXZhdGUgX19kYXRhTWFwOiBJRGljdGlvbmFyeTxJRGljdGlvbmFyeTxNb2RlbD4+ID0ge307XG4gIEBvYnNlcnZhYmxlIHByaXZhdGUgX19kYXRhTGlzdDogSURpY3Rpb25hcnk8SU9ic2VydmFibGVBcnJheTxNb2RlbD4+ID0ge307XG5cbiAgY29uc3RydWN0b3IoZGF0YTogQXJyYXk8SVJhd01vZGVsPiA9IFtdKSB7XG4gICAgdGhpcy5pbnNlcnQoZGF0YSk7XG4gICAgc3RvcmFnZS5yZWdpc3RlckNvbGxlY3Rpb24odGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogRnVuY3Rpb24gZm9yIGluc2VydGluZyByYXcgbW9kZWxzIGludG8gdGhlIGNvbGxlY3Rpb24uIFVzZWQgd2hlbiBoeWRyYXRpbmcgdGhlIGNvbGxlY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheTxJUmF3TW9kZWw+fSBkYXRhIFJhdyBtb2RlbCBkYXRhXG4gICAqIEByZXR1cm5zIHtBcnJheTxNb2RlbD59IEEgbGlzdCBvZiBpbml0aWFsaXplZCBtb2RlbHNcbiAgICogQG1lbWJlcm9mIENvbGxlY3Rpb25cbiAgICovXG4gIHB1YmxpYyBpbnNlcnQoZGF0YTogQXJyYXk8SVJhd01vZGVsPik6IEFycmF5PE1vZGVsPiB7XG4gICAgdGhpcy5fX2NvbmZpcm1WYWxpZCgpO1xuICAgIGNvbnN0IG1vZGVscyA9IGluaXRNb2RlbHModGhpcywgZGF0YSk7XG4gICAgdGhpcy5fX2luc2VydE1vZGVsKG1vZGVscyk7XG4gICAgcmV0dXJuIG1vZGVscztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYW4gZXhpc3RpbmcgbW9kZWwgdG8gdGhlIGNvbGxlY3Rpb25cbiAgICpcbiAgICogQHRlbXBsYXRlIFRcbiAgICogQHBhcmFtIHtUfSBkYXRhIE1vZGVsIHRvIGJlIGFkZGVkXG4gICAqIEByZXR1cm5zIHtUfSBBZGRlZCBtb2RlbFxuICAgKiBAbWVtYmVyb2YgQ29sbGVjdGlvblxuICAgKi9cbiAgcHVibGljIGFkZDxUIGV4dGVuZHMgTW9kZWw+KGRhdGE6IFQpOiBUO1xuXG4gIC8qKlxuICAgKiBBZGQgYW4gYXJyYXkgb2YgZXhpc3RpbmcgbW9kZWxzIHRvIHRoZSBjb2xsZWN0aW9uXG4gICAqXG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwYXJhbSB7QXJyYXk8VD59IGRhdGEgQXJyYXkgb2YgbW9kZWxzIHRvIGJlIGFkZGVkXG4gICAqIEByZXR1cm5zIHtBcnJheTxUPn0gQWRkZWQgbW9kZWxzXG4gICAqIEBtZW1iZXJvZiBDb2xsZWN0aW9uXG4gICAqL1xuICBwdWJsaWMgYWRkPFQgZXh0ZW5kcyBNb2RlbD4oZGF0YTogQXJyYXk8VD4pOiBBcnJheTxUPjtcblxuICAvKipcbiAgICogQWRkIGEgbmV3IG1vZGVsIHRvIHRoZSBjb2xsZWN0aW9uXG4gICAqXG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwYXJhbSB7KElSYXdNb2RlbHxJRGljdGlvbmFyeTxhbnk+KX0gZGF0YSBOZXcgZGF0YSB0byBiZSBhZGRlZFxuICAgKiBAcGFyYW0geyhJVHlwZXxJTW9kZWxDb25zdHJ1Y3RvcjxUPil9IG1vZGVsIE1vZGVsIHR5cGUgdG8gYmUgYWRkZWRcbiAgICogQHJldHVybnMge1R9IEFkZGVkIG1vZGVsXG4gICAqIEBtZW1iZXJvZiBDb2xsZWN0aW9uXG4gICAqL1xuICBwdWJsaWMgYWRkPFQgZXh0ZW5kcyBNb2RlbD4oZGF0YTogSVJhd01vZGVsfElEaWN0aW9uYXJ5PGFueT4sIG1vZGVsOiBJVHlwZXxJTW9kZWxDb25zdHJ1Y3RvcjxUPik6IFQ7XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBhcnJheSBvZiBuZXcgbW9kZWxzIHRvIHRoZSBjb2xsZWN0aW9uXG4gICAqXG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBwYXJhbSB7QXJyYXk8SVJhd01vZGVsfElEaWN0aW9uYXJ5PGFueT4+fSBkYXRhIEFycmF5IG9mIG5ldyBkYXRhIHRvIGJlIGFkZGVkXG4gICAqIEBwYXJhbSB7KElUeXBlfElNb2RlbENvbnN0cnVjdG9yPFQ+KX0gbW9kZWwgTW9kZWwgdHlwZSB0byBiZSBhZGRlZFxuICAgKiBAcmV0dXJucyB7QXJyYXk8VD59IEFkZGVkIG1vZGVsc1xuICAgKiBAbWVtYmVyb2YgQ29sbGVjdGlvblxuICAgKi9cbiAgcHVibGljIGFkZDxUIGV4dGVuZHMgTW9kZWw+KGRhdGE6IEFycmF5PElSYXdNb2RlbHxJRGljdGlvbmFyeTxhbnk+PiwgbW9kZWw6IElUeXBlfElNb2RlbENvbnN0cnVjdG9yPFQ+KTogQXJyYXk8VD47XG5cbiAgcHVibGljIGFkZChcbiAgICBkYXRhOiBNb2RlbHxJUmF3TW9kZWx8SURpY3Rpb25hcnk8YW55PnxBcnJheTxNb2RlbD58QXJyYXk8SVJhd01vZGVsfElEaWN0aW9uYXJ5PGFueT4+LFxuICAgIG1vZGVsPzogSVR5cGV8SU1vZGVsQ29uc3RydWN0b3IsXG4gICk6IE1vZGVsfEFycmF5PE1vZGVsPiB7XG4gICAgdGhpcy5fX2NvbmZpcm1WYWxpZCgpO1xuICAgIHJldHVybiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5KSA/IHRoaXMuX19hZGRBcnJheShkYXRhLCBtb2RlbCkgOiB0aGlzLl9fYWRkU2luZ2xlKGRhdGEsIG1vZGVsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGEgbW9kZWwgYmFzZWQgb24gdGhlIGRlZmluZWQgdHlwZSBhbmQgKG9wdGlvbmFsKSBpZGVudGlmaWVyXG4gICAqXG4gICAqIEBwYXJhbSB7KElUeXBlfHR5cGVvZiBNb2RlbHxNb2RlbCl9IHR5cGUgTW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ge0lJZGVudGlmaWVyfSBbaWRdIE1vZGVsIGlkZW50aWZpZXJcbiAgICogQHJldHVybnMgeyhNb2RlbHxudWxsKX0gVGhlIGZpcnN0IG1hdGNoaW5nIG1vZGVsXG4gICAqIEBtZW1iZXJvZiBDb2xsZWN0aW9uXG4gICAqL1xuICBwdWJsaWMgZmluZCh0eXBlOiBJVHlwZXx0eXBlb2YgTW9kZWx8TW9kZWwsIGlkPzogSUlkZW50aWZpZXIpOiBNb2RlbHxudWxsO1xuXG4gIC8qKlxuICAgKiBGaW5kIGEgbW9kZWwgYmFzZWQgb24gYSBtYXRjaGluZyBmdW5jdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge1RGaWx0ZXJGbn0gdGVzdCBGdW5jdGlvbiB1c2VkIHRvIG1hdGNoIHRoZSBtb2RlbFxuICAgKiBAcmV0dXJucyB7KE1vZGVsfG51bGwpfSBUaGUgZmlyc3QgbWF0Y2hpbmcgbW9kZWxcbiAgICogQG1lbWJlcm9mIENvbGxlY3Rpb25cbiAgICovXG4gIHB1YmxpYyBmaW5kKHRlc3Q6IFRGaWx0ZXJGbik6IE1vZGVsfG51bGw7XG5cbiAgcHVibGljIGZpbmQobW9kZWw6IElUeXBlfHR5cGVvZiBNb2RlbHwoVEZpbHRlckZuKSwgaWQ/OiBJSWRlbnRpZmllcik6IE1vZGVsfG51bGwge1xuICAgIHJldHVybiBpc1NlbGVjdG9yRnVuY3Rpb24obW9kZWwpXG4gICAgICA/IHRoaXMuX19kYXRhLmZpbmQobW9kZWwgYXMgVEZpbHRlckZuKVxuICAgICAgOiB0aGlzLl9fZmluZEJ5VHlwZShtb2RlbCBhcyB0eXBlb2YgTW9kZWwsIGlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWx0ZXIgbW9kZWxzIGJhc2VkIG9uIGEgbWF0Y2hpbmcgZnVuY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHtURmlsdGVyRm59IHRlc3QgRnVuY3Rpb24gdXNlZCB0byBtYXRjaCB0aGUgbW9kZWxzXG4gICAqIEByZXR1cm5zIHsoTW9kZWx8bnVsbCl9IFRoZSBtYXRjaGluZyBtb2RlbHNcbiAgICogQG1lbWJlcm9mIENvbGxlY3Rpb25cbiAgICovXG4gIHB1YmxpYyBmaWx0ZXIodGVzdDogVEZpbHRlckZuKTogQXJyYXk8TW9kZWw+IHtcbiAgICByZXR1cm4gdGhpcy5fX2RhdGEuZmlsdGVyKHRlc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYWxsIG1hdGNoaW5nIG1vZGVscyBvciBhbGwgbW9kZWxzIGlmIG5vIHR5cGUgaXMgZ2l2ZW5cbiAgICpcbiAgICogQHBhcmFtIHsoSVR5cGV8dHlwZW9mIE1vZGVsKX0gW21vZGVsXSBNb2RlbCB0eXBlIHRvIHNlbGVjdFxuICAgKiBAcmV0dXJucyB7QXJyYXk8TW9kZWw+fSBMaXN0IG9mIG1hdGNoaW5nIG1vZGVsc1xuICAgKiBAbWVtYmVyb2YgQ29sbGVjdGlvblxuICAgKi9cbiAgcHVibGljIGZpbmRBbGwobW9kZWw/OiBJVHlwZXx0eXBlb2YgTW9kZWwpOiBBcnJheTxNb2RlbD4ge1xuICAgIGlmIChtb2RlbCkge1xuICAgICAgY29uc3QgdHlwZSA9IGdldE1vZGVsVHlwZShtb2RlbCk7XG4gICAgICByZXR1cm4gdGhpcy5fX2RhdGFMaXN0W3R5cGVdIHx8IFtdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fX2RhdGE7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSBtb2RlbCBpcyBpbiB0aGUgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge01vZGVsfSBtb2RlbCBNb2RlbCB0byBjaGVja1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVGhlIGdpdmVuIG1vZGVsIGlzIGluIHRoZSBjb2xsZWN0aW9uXG4gICAqIEBtZW1iZXJvZiBDb2xsZWN0aW9uXG4gICAqL1xuICBwdWJsaWMgaGFzSXRlbShtb2RlbDogTW9kZWwpOiBib29sZWFuIHtcbiAgICBjb25zdCB0eXBlID0gZ2V0TW9kZWxUeXBlKG1vZGVsKTtcbiAgICBjb25zdCBpZCA9IGdldE1vZGVsSWQobW9kZWwpO1xuICAgIHJldHVybiB0eXBlIGluIHRoaXMuX19kYXRhTWFwICYmIGlkIGluIHRoaXMuX19kYXRhTWFwW3R5cGVdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgZmlyc3QgbW9kZWwgYmFzZWQgb24gdGhlIHR5cGUgYW5kIChvcHRpb25hbCkgaWRlbnRpZmllclxuICAgKlxuICAgKiBAcGFyYW0geyhJVHlwZXx0eXBlb2YgTW9kZWwpfSB0eXBlIE1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHtJSWRlbnRpZmllcn0gW2lkXSBNb2RlbCBpZGVudGlmaWVyXG4gICAqIEBtZW1iZXJvZiBDb2xsZWN0aW9uXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlKHR5cGU6IElUeXBlfHR5cGVvZiBNb2RlbCwgaWQ/OiBJSWRlbnRpZmllcik7XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgZ2l2ZW4gbW9kZWwgZnJvbSB0aGUgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge01vZGVsfSBtb2RlbCBNb2RlbCB0byBiZSByZW1vdmVkIGZyb20gdGhlIGNvbGxlY3Rpb25cbiAgICogQG1lbWJlcm9mIENvbGxlY3Rpb25cbiAgICovXG4gIHB1YmxpYyByZW1vdmUobW9kZWw6IE1vZGVsKTtcblxuICBwdWJsaWMgcmVtb3ZlKG9iajogSVR5cGV8dHlwZW9mIE1vZGVsfE1vZGVsLCBpZD86IElJZGVudGlmaWVyKSB7XG4gICAgdGhpcy5fX2NvbmZpcm1WYWxpZCgpO1xuICAgIGNvbnN0IG1vZGVsID0gdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgPyBvYmogOiB0aGlzLmZpbmQob2JqLCBpZCk7XG4gICAgaWYgKG1vZGVsKSB7XG4gICAgICB0aGlzLl9fcmVtb3ZlTW9kZWwobW9kZWwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIHRvdGFsIGNvdW50IG9mIG1vZGVscyBpbiB0aGUgY29sbGVjdGlvblxuICAgKlxuICAgKiBAcmVhZG9ubHlcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQG1lbWJlcm9mIENvbGxlY3Rpb25cbiAgICovXG4gIEBjb21wdXRlZCBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9fZGF0YS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBzZXJpYWxpemFibGUgdmFsdWUgb2YgdGhlIGNvbGxlY3Rpb25cbiAgICpcbiAgICogQHJldHVybnMge0FycmF5PElSYXdNb2RlbD59IFB1cmUgSlMgdmFsdWUgb2YgdGhlIGNvbGxlY3Rpb25cbiAgICogQG1lbWJlcm9mIENvbGxlY3Rpb25cbiAgICovXG4gIHB1YmxpYyB0b0pTT04oKTogQXJyYXk8SVJhd01vZGVsPiB7XG4gICAgcmV0dXJuIHRoaXMuX19kYXRhLm1hcChtb2RlbFRvSlNPTik7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgY29sbGVjdGlvbiBhbmQgY2xlYW4gdXAgYWxsIHJlZmVyZW5jZXNcbiAgICpcbiAgICogQG1lbWJlcm9mIENvbGxlY3Rpb25cbiAgICovXG4gIHB1YmxpYyBkZXN0cm95KCkge1xuICAgIHRoaXMuX19jb25maXJtVmFsaWQoKTtcbiAgICBzdG9yYWdlLnVucmVnaXN0ZXJDb2xsZWN0aW9uKHRoaXMpO1xuICAgIHRoaXMuX19pbml0aWFsaXplZCA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHRoZSBjb2xsZWN0aW9uIChyZW1vdmUgYWxsIG1vZGVscylcbiAgICpcbiAgICogQG1lbWJlcm9mIENvbGxlY3Rpb25cbiAgICovXG4gIHB1YmxpYyByZXNldCgpIHtcbiAgICB0aGlzLl9fY29uZmlybVZhbGlkKCk7XG4gICAgdGhpcy5fX2RhdGEucmVwbGFjZShbXSk7XG4gICAgY29uc3QgdHlwZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9fZGF0YUxpc3QpO1xuICAgIHR5cGVzLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9fZGF0YUxpc3RbdHlwZV07XG4gICAgICBkZWxldGUgdGhpcy5fX2RhdGFNYXBbdHlwZV07XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9fY29uZmlybVZhbGlkKCkge1xuICAgIGlmICghdGhpcy5fX2luaXRpYWxpemVkKSB7XG4gICAgICB0aHJvdyBlcnJvcihDT0xMRUNUSU9OX0RFU1RST1lFRCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfX2FkZEFycmF5PFQgZXh0ZW5kcyBNb2RlbD4oZGF0YTogQXJyYXk8VD4pOiBBcnJheTxUPjtcbiAgcHJpdmF0ZSBfX2FkZEFycmF5PFQgZXh0ZW5kcyBNb2RlbD4oZGF0YTogQXJyYXk8SURpY3Rpb25hcnk8YW55Pj4sIG1vZGVsPzogSVR5cGV8SU1vZGVsQ29uc3RydWN0b3I8VD4pOiBBcnJheTxUPjtcbiAgcHJpdmF0ZSBfX2FkZEFycmF5KGRhdGE6IEFycmF5PE1vZGVsfElEaWN0aW9uYXJ5PGFueT4+LCBtb2RlbD86IElUeXBlfElNb2RlbENvbnN0cnVjdG9yKTogQXJyYXk8TW9kZWw+IHtcbiAgICByZXR1cm4gZGF0YS5maWx0ZXIoQm9vbGVhbikubWFwKChpdGVtKSA9PiB0aGlzLl9fYWRkU2luZ2xlKGl0ZW0sIG1vZGVsKSk7XG4gIH1cblxuICBwcml2YXRlIF9fYWRkU2luZ2xlPFQgZXh0ZW5kcyBNb2RlbD4oZGF0YTogVCk6IFQ7XG4gIHByaXZhdGUgX19hZGRTaW5nbGU8VCBleHRlbmRzIE1vZGVsPihkYXRhOiBJRGljdGlvbmFyeTxhbnk+LCBtb2RlbD86IElUeXBlfElNb2RlbENvbnN0cnVjdG9yPFQ+KTogVDtcbiAgcHJpdmF0ZSBfX2FkZFNpbmdsZShkYXRhOiBNb2RlbHxJRGljdGlvbmFyeTxhbnk+LCBtb2RlbD86IElUeXBlfElNb2RlbENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIE1vZGVsKSB7XG4gICAgICBpZiAoIXRoaXMuaGFzSXRlbShkYXRhKSkge1xuICAgICAgICB0aGlzLl9faW5zZXJ0TW9kZWwoZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIGlmICghbW9kZWwpIHtcbiAgICAgIHRocm93IGVycm9yKFVOREVGSU5FRF9UWVBFKTtcbiAgICB9XG5cbiAgICBjb25zdCB0eXBlID0gZ2V0TW9kZWxUeXBlKG1vZGVsIGFzIElUeXBlfHR5cGVvZiBNb2RlbCk7XG4gICAgY29uc3QgbW9kZWxJbnN0YW5jZSA9IHVwc2VydE1vZGVsKGRhdGEsIHR5cGUsIHRoaXMpO1xuICAgIHRoaXMuX19pbnNlcnRNb2RlbChtb2RlbEluc3RhbmNlLCB0eXBlKTtcblxuICAgIGNvbnN0IGlkID0gZ2V0TW9kZWxJZChtb2RlbEluc3RhbmNlKTtcblxuICAgIHJldHVybiBtb2RlbEluc3RhbmNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfX2luc2VydE1vZGVsKG1vZGVsOiBNb2RlbHxBcnJheTxNb2RlbD4sIHR5cGU/OiBJVHlwZSwgaWQ/OiBJSWRlbnRpZmllcikge1xuICAgIGlmIChtb2RlbCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICByZXR1cm4gbW9kZWwuZm9yRWFjaCgoaXRlbSkgPT4gdGhpcy5fX2luc2VydE1vZGVsKGl0ZW0sIHR5cGUsIGlkKSk7XG4gICAgfVxuXG4gICAgY29uc3QgbW9kZWxUeXBlID0gdHlwZSB8fCBnZXRNb2RlbFR5cGUobW9kZWwpO1xuICAgIGNvbnN0IG1vZGVsSWQgPSBpZCB8fCBnZXRNb2RlbElkKG1vZGVsKTtcbiAgICB0aGlzLl9fZGF0YS5wdXNoKG1vZGVsKTtcbiAgICB0aGlzLl9fZGF0YUxpc3RbbW9kZWxUeXBlXSA9IHRoaXMuX19kYXRhTGlzdFttb2RlbFR5cGVdIHx8IG9ic2VydmFibGUuc2hhbGxvd0FycmF5KFtdKTtcbiAgICB0aGlzLl9fZGF0YUxpc3RbbW9kZWxUeXBlXS5wdXNoKG1vZGVsKTtcbiAgICB0aGlzLl9fZGF0YU1hcFttb2RlbFR5cGVdID0gdGhpcy5fX2RhdGFNYXBbbW9kZWxUeXBlXSB8fCBvYnNlcnZhYmxlLnNoYWxsb3dPYmplY3Qoe30pO1xuICAgIHRoaXMuX19kYXRhTWFwW21vZGVsVHlwZV1bbW9kZWxJZF0gPSBtb2RlbDtcbiAgfVxuXG4gIHByaXZhdGUgX19yZW1vdmVNb2RlbChtb2RlbDogTW9kZWx8QXJyYXk8TW9kZWw+LCB0eXBlPzogSVR5cGUsIGlkPzogSUlkZW50aWZpZXIpIHtcbiAgICBpZiAobW9kZWwgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgcmV0dXJuIG1vZGVsLmZvckVhY2goKGl0ZW0pID0+IHRoaXMuX19yZW1vdmVNb2RlbChpdGVtLCB0eXBlLCBpZCkpO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZGVsVHlwZSA9IHR5cGUgfHwgZ2V0TW9kZWxUeXBlKG1vZGVsKTtcbiAgICBjb25zdCBtb2RlbElkID0gaWQgfHwgZ2V0TW9kZWxJZChtb2RlbCk7XG4gICAgdGhpcy5fX2RhdGEucmVtb3ZlKG1vZGVsKTtcbiAgICB0aGlzLl9fZGF0YUxpc3RbbW9kZWxUeXBlXS5yZW1vdmUobW9kZWwpO1xuICAgIGRlbGV0ZSB0aGlzLl9fZGF0YU1hcFttb2RlbFR5cGVdW21vZGVsSWRdO1xuICB9XG5cbiAgcHJpdmF0ZSBfX2ZpbmRCeVR5cGUobW9kZWw6IElUeXBlfHR5cGVvZiBNb2RlbHxNb2RlbCwgaWQ/OiBJSWRlbnRpZmllcikge1xuICAgIGNvbnN0IHR5cGUgPSBnZXRNb2RlbFR5cGUobW9kZWwpO1xuXG4gICAgaWYgKGlkKSB7XG4gICAgICBjb25zdCBtb2RlbHMgPSB0aGlzLl9fZGF0YU1hcFt0eXBlXSB8fCB7fTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdGaW5kIGJ5IHR5cGUnLCB0eXBlLCBpZCwgT2JqZWN0LmtleXMobW9kZWxzKSlcbiAgICAgIHJldHVybiBtb2RlbHNbaWRdIHx8IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9fZGF0YUxpc3RbdHlwZV0gfHwgW107XG4gICAgICByZXR1cm4gZGF0YVswXSB8fCBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX19jaGFuZ2VNb2RlbElkKG9sZElkOiBJSWRlbnRpZmllciwgbmV3SWQ6IElJZGVudGlmaWVyLCB0eXBlOiBJVHlwZSkge1xuICAgIHRoaXMuX19kYXRhTWFwW3R5cGVdW25ld0lkXSA9IHRoaXMuX19kYXRhTWFwW3R5cGVdW29sZElkXTtcbiAgICBkZWxldGUgdGhpcy5fX2RhdGFNYXBbdHlwZV1bb2xkSWRdO1xuICB9XG59XG4iXX0=
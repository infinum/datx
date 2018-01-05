"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
var errors_1 = require("../errors");
var format_1 = require("../helpers/format");
var mixin_1 = require("../helpers/mixin");
var utils_1 = require("../helpers/model/utils");
var storage_1 = require("../services/storage");
/**
 * Extends the model with the exposed meta data
 *
 * @export
 * @template T
 * @param {IModelConstructor<T>} Base Model to extend
 * @returns Extended model
 */
function withMeta(Base) {
    var BaseClass = Base;
    if (!mixin_1.isModel(BaseClass)) {
        throw format_1.error(errors_1.DECORATE_MODEL);
    }
    var WithMeta = /** @class */ (function (_super) {
        __extends(WithMeta, _super);
        function WithMeta() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(WithMeta.prototype, "meta", {
            get: function () {
                return Object.freeze({
                    collections: utils_1.getModelCollections(this),
                    id: utils_1.getModelId(this),
                    original: storage_1.storage.getModelMetaKey(this, 'originalId') && utils_1.getOriginalModel(this) || undefined,
                    type: utils_1.getModelType(this),
                });
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            mobx_1.computed
        ], WithMeta.prototype, "meta", null);
        return WithMeta;
    }(BaseClass));
    return WithMeta;
}
exports.withMeta = withMeta;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l0aE1ldGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWl4aW5zL3dpdGhNZXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZCQUE4QjtBQUU5QixvQ0FBeUM7QUFDekMsNENBQXdDO0FBQ3hDLDBDQUF5QztBQUN6QyxnREFBdUc7QUFJdkcsK0NBQTRDO0FBRTVDOzs7Ozs7O0dBT0c7QUFDSCxrQkFBMEMsSUFBMEI7SUFDbEUsSUFBTSxTQUFTLEdBQUcsSUFBb0IsQ0FBQztJQUV2QyxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsTUFBTSxjQUFLLENBQUMsdUJBQWMsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDtRQUF1Qiw0QkFBUztRQUFoQzs7UUFTQSxDQUFDO1FBUlcsc0JBQVcsMEJBQUk7aUJBQWY7Z0JBQ1IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7b0JBQ25CLFdBQVcsRUFBRSwyQkFBbUIsQ0FBQyxJQUFJLENBQUM7b0JBQ3RDLEVBQUUsRUFBRSxrQkFBVSxDQUFDLElBQUksQ0FBQztvQkFDcEIsUUFBUSxFQUFFLGlCQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxTQUFTO29CQUM1RixJQUFJLEVBQUUsb0JBQVksQ0FBQyxJQUFJLENBQUM7aUJBQ3pCLENBQUMsQ0FBQztZQUNMLENBQUM7OztXQUFBO1FBUFM7WUFBVCxlQUFROzRDQU9SO1FBQ0gsZUFBQztLQUFBLEFBVEQsQ0FBdUIsU0FBUyxHQVMvQjtJQUVELE1BQU0sQ0FBQyxRQUFnRCxDQUFDO0FBQzFELENBQUM7QUFuQkQsNEJBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb21wdXRlZH0gZnJvbSAnbW9ieCc7XG5cbmltcG9ydCB7REVDT1JBVEVfTU9ERUx9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi9oZWxwZXJzL2Zvcm1hdCc7XG5pbXBvcnQge2lzTW9kZWx9IGZyb20gJy4uL2hlbHBlcnMvbWl4aW4nO1xuaW1wb3J0IHtnZXRNb2RlbENvbGxlY3Rpb25zLCBnZXRNb2RlbElkLCBnZXRNb2RlbFR5cGUsIGdldE9yaWdpbmFsTW9kZWx9IGZyb20gJy4uL2hlbHBlcnMvbW9kZWwvdXRpbHMnO1xuaW1wb3J0IHtJTWV0YU1peGlufSBmcm9tICcuLi9pbnRlcmZhY2VzL0lNZXRhTWl4aW4nO1xuaW1wb3J0IHtJTW9kZWxDb25zdHJ1Y3Rvcn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9JTW9kZWxDb25zdHJ1Y3Rvcic7XG5pbXBvcnQge01vZGVsfSBmcm9tICcuLi9Nb2RlbCc7XG5pbXBvcnQge3N0b3JhZ2V9IGZyb20gJy4uL3NlcnZpY2VzL3N0b3JhZ2UnO1xuXG4vKipcbiAqIEV4dGVuZHMgdGhlIG1vZGVsIHdpdGggdGhlIGV4cG9zZWQgbWV0YSBkYXRhXG4gKlxuICogQGV4cG9ydFxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7SU1vZGVsQ29uc3RydWN0b3I8VD59IEJhc2UgTW9kZWwgdG8gZXh0ZW5kXG4gKiBAcmV0dXJucyBFeHRlbmRlZCBtb2RlbFxuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aE1ldGE8VCBleHRlbmRzIE1vZGVsPihCYXNlOiBJTW9kZWxDb25zdHJ1Y3RvcjxUPikge1xuICBjb25zdCBCYXNlQ2xhc3MgPSBCYXNlIGFzIHR5cGVvZiBNb2RlbDtcblxuICBpZiAoIWlzTW9kZWwoQmFzZUNsYXNzKSkge1xuICAgIHRocm93IGVycm9yKERFQ09SQVRFX01PREVMKTtcbiAgfVxuXG4gIGNsYXNzIFdpdGhNZXRhIGV4dGVuZHMgQmFzZUNsYXNzIGltcGxlbWVudHMgSU1ldGFNaXhpbiB7XG4gICAgQGNvbXB1dGVkIHB1YmxpYyBnZXQgbWV0YSgpIHtcbiAgICAgIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgY29sbGVjdGlvbnM6IGdldE1vZGVsQ29sbGVjdGlvbnModGhpcyksXG4gICAgICAgIGlkOiBnZXRNb2RlbElkKHRoaXMpLFxuICAgICAgICBvcmlnaW5hbDogc3RvcmFnZS5nZXRNb2RlbE1ldGFLZXkodGhpcywgJ29yaWdpbmFsSWQnKSAmJiBnZXRPcmlnaW5hbE1vZGVsKHRoaXMpIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgdHlwZTogZ2V0TW9kZWxUeXBlKHRoaXMpLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFdpdGhNZXRhIGFzIElNb2RlbENvbnN0cnVjdG9yPElNZXRhTWl4aW48VD4gJiBUPjtcbn1cbiJdfQ==
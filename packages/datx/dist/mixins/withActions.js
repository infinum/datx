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
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../errors");
var format_1 = require("../helpers/format");
var mixin_1 = require("../helpers/mixin");
var init_1 = require("../helpers/model/init");
var utils_1 = require("../helpers/model/utils");
/**
 * Extends the model with some handy actions
 *
 * @export
 * @template T
 * @param {IModelConstructor<T>} Base Model to extend
 * @returns Extended model
 */
function withActions(Base) {
    var BaseClass = Base;
    if (!mixin_1.isModel(BaseClass)) {
        throw format_1.error(errors_1.DECORATE_MODEL);
    }
    var WithActions = /** @class */ (function (_super) {
        __extends(WithActions, _super);
        function WithActions() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        WithActions.prototype.update = function (data) {
            utils_1.updateModel(this, data);
        };
        WithActions.prototype.clone = function () {
            // @ts-ignore
            return utils_1.cloneModel(this);
        };
        WithActions.prototype.assign = function (key, value) {
            utils_1.assignModel(this, key, value);
        };
        WithActions.prototype.addReference = function (key, value, options) {
            init_1.initModelRef(this, key, options, value);
        };
        WithActions.prototype.toJSON = function () {
            return utils_1.modelToJSON(this);
        };
        return WithActions;
    }(BaseClass));
    return WithActions;
}
exports.withActions = withActions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l0aEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWl4aW5zL3dpdGhBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLG9DQUF5QztBQUN6Qyw0Q0FBd0M7QUFDeEMsMENBQXlDO0FBQ3pDLDhDQUFtRDtBQUNuRCxnREFBeUY7QUFRekY7Ozs7Ozs7R0FPRztBQUNILHFCQUE2QyxJQUEwQjtJQUNyRSxJQUFNLFNBQVMsR0FBRyxJQUFvQixDQUFDO0lBRXZDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixNQUFNLGNBQUssQ0FBQyx1QkFBYyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEO1FBQTBCLCtCQUFTO1FBQW5DOztRQXlCQSxDQUFDO1FBeEJRLDRCQUFNLEdBQWIsVUFBYyxJQUFzQjtZQUNsQyxtQkFBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRU0sMkJBQUssR0FBWjtZQUNFLGFBQWE7WUFDYixNQUFNLENBQUMsa0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRU0sNEJBQU0sR0FBYixVQUFjLEdBQVcsRUFBRSxLQUFVO1lBQ25DLG1CQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRU0sa0NBQVksR0FBbkIsVUFDRSxHQUFXLEVBQ1gsS0FBbUIsRUFDbkIsT0FBNkI7WUFFN0IsbUJBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRU0sNEJBQU0sR0FBYjtZQUNFLE1BQU0sQ0FBQyxtQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFDSCxrQkFBQztJQUFELENBQUMsQUF6QkQsQ0FBMEIsU0FBUyxHQXlCbEM7SUFFRCxNQUFNLENBQUMsV0FBc0QsQ0FBQztBQUNoRSxDQUFDO0FBbkNELGtDQW1DQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29tcHV0ZWR9IGZyb20gJ21vYngnO1xuXG5pbXBvcnQge0RFQ09SQVRFX01PREVMfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vaGVscGVycy9mb3JtYXQnO1xuaW1wb3J0IHtpc01vZGVsfSBmcm9tICcuLi9oZWxwZXJzL21peGluJztcbmltcG9ydCB7aW5pdE1vZGVsUmVmfSBmcm9tICcuLi9oZWxwZXJzL21vZGVsL2luaXQnO1xuaW1wb3J0IHthc3NpZ25Nb2RlbCwgY2xvbmVNb2RlbCwgbW9kZWxUb0pTT04sIHVwZGF0ZU1vZGVsfSBmcm9tICcuLi9oZWxwZXJzL21vZGVsL3V0aWxzJztcbmltcG9ydCB7SUFjdGlvbnNNaXhpbn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9JQWN0aW9uc01peGluJztcbmltcG9ydCB7SURpY3Rpb25hcnl9IGZyb20gJy4uL2ludGVyZmFjZXMvSURpY3Rpb25hcnknO1xuaW1wb3J0IHtJTW9kZWxDb25zdHJ1Y3Rvcn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9JTW9kZWxDb25zdHJ1Y3Rvcic7XG5pbXBvcnQge0lSZWZlcmVuY2VPcHRpb25zfSBmcm9tICcuLi9pbnRlcmZhY2VzL0lSZWZlcmVuY2VPcHRpb25zJztcbmltcG9ydCB7VFJlZlZhbHVlfSBmcm9tICcuLi9pbnRlcmZhY2VzL1RSZWZWYWx1ZSc7XG5pbXBvcnQge01vZGVsfSBmcm9tICcuLi9Nb2RlbCc7XG5cbi8qKlxuICogRXh0ZW5kcyB0aGUgbW9kZWwgd2l0aCBzb21lIGhhbmR5IGFjdGlvbnNcbiAqXG4gKiBAZXhwb3J0XG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtJTW9kZWxDb25zdHJ1Y3RvcjxUPn0gQmFzZSBNb2RlbCB0byBleHRlbmRcbiAqIEByZXR1cm5zIEV4dGVuZGVkIG1vZGVsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoQWN0aW9uczxUIGV4dGVuZHMgTW9kZWw+KEJhc2U6IElNb2RlbENvbnN0cnVjdG9yPFQ+KSB7XG4gIGNvbnN0IEJhc2VDbGFzcyA9IEJhc2UgYXMgdHlwZW9mIE1vZGVsO1xuXG4gIGlmICghaXNNb2RlbChCYXNlQ2xhc3MpKSB7XG4gICAgdGhyb3cgZXJyb3IoREVDT1JBVEVfTU9ERUwpO1xuICB9XG5cbiAgY2xhc3MgV2l0aEFjdGlvbnMgZXh0ZW5kcyBCYXNlQ2xhc3MgaW1wbGVtZW50cyBJQWN0aW9uc01peGluPFQ+IHtcbiAgICBwdWJsaWMgdXBkYXRlKGRhdGE6IElEaWN0aW9uYXJ5PGFueT4pIHtcbiAgICAgIHVwZGF0ZU1vZGVsKHRoaXMsIGRhdGEpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbG9uZSgpOiBJQWN0aW9uc01peGluPFQ+ICYgVCB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICByZXR1cm4gY2xvbmVNb2RlbCh0aGlzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXNzaWduKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgICBhc3NpZ25Nb2RlbCh0aGlzLCBrZXksIHZhbHVlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkUmVmZXJlbmNlPFYgZXh0ZW5kcyBNb2RlbCwgVSBleHRlbmRzIHR5cGVvZiBNb2RlbD4oXG4gICAgICBrZXk6IHN0cmluZyxcbiAgICAgIHZhbHVlOiBUUmVmVmFsdWU8Vj4sXG4gICAgICBvcHRpb25zOiBJUmVmZXJlbmNlT3B0aW9uczxVPixcbiAgICApIHtcbiAgICAgIGluaXRNb2RlbFJlZih0aGlzLCBrZXksIG9wdGlvbnMsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9KU09OKCkge1xuICAgICAgcmV0dXJuIG1vZGVsVG9KU09OKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBXaXRoQWN0aW9ucyBhcyBJTW9kZWxDb25zdHJ1Y3RvcjxJQWN0aW9uc01peGluPFQ+ICYgVD47XG59XG4iXX0=
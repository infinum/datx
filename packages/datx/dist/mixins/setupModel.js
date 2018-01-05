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
var ReferenceType_1 = require("../enums/ReferenceType");
var errors_1 = require("../errors");
var format_1 = require("../helpers/format");
var mixin_1 = require("../helpers/mixin");
var prop_1 = require("../prop");
function setupModel(Base, _a) {
    var _b = _a === void 0 ? { fields: {} } : _a, fields = _b.fields, references = _b.references, type = _b.type, idAttribute = _b.idAttribute, typeAttribute = _b.typeAttribute;
    var BaseClass = Base;
    if (!mixin_1.isModel(BaseClass)) {
        throw format_1.error(errors_1.DECORATE_MODEL);
    }
    var ModelWithProps = /** @class */ (function (_super) {
        __extends(ModelWithProps, _super);
        function ModelWithProps() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ModelWithProps;
    }(BaseClass));
    if (type) {
        ModelWithProps.type = type;
    }
    if (idAttribute) {
        prop_1.default.identifier(ModelWithProps.prototype, idAttribute);
    }
    if (typeAttribute) {
        prop_1.default.type(ModelWithProps.prototype, typeAttribute);
    }
    if (fields) {
        Object.keys(fields).forEach(function (key) {
            prop_1.default.defaultValue(fields[key])(ModelWithProps.prototype, key);
        });
    }
    if (references) {
        Object.keys(references).forEach(function (key) {
            var _a = references[key], model = _a.model, property = _a.property;
            switch (references[key].type) {
                case ReferenceType_1.ReferenceType.TO_ONE:
                    return prop_1.default.toOne(model)(ModelWithProps.prototype, key);
                case ReferenceType_1.ReferenceType.TO_MANY:
                    return prop_1.default.toMany(model, property)(ModelWithProps.prototype, key);
                default:
                    return prop_1.default.toOneOrMany(model)(ModelWithProps.prototype, key);
            }
        });
    }
    return ModelWithProps;
}
exports.setupModel = setupModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXBNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9taXhpbnMvc2V0dXBNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSx3REFBcUQ7QUFDckQsb0NBQXlDO0FBQ3pDLDRDQUF3QztBQUN4QywwQ0FBeUM7QUFNekMsZ0NBQTJCO0FBRTNCLG9CQUNFLElBQStCLEVBQy9CLEVBWTJCO1FBWjNCLHdDQVkyQixFQVh6QixrQkFBTSxFQUNOLDBCQUFVLEVBQ1YsY0FBSSxFQUNKLDRCQUFXLEVBQ1gsZ0NBQWE7SUFTZixJQUFNLFNBQVMsR0FBRyxJQUFvQixDQUFDO0lBRXZDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixNQUFNLGNBQUssQ0FBQyx1QkFBYyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEO1FBQTZCLGtDQUFTO1FBQXRDOztRQUF3QyxDQUFDO1FBQUQscUJBQUM7SUFBRCxDQUFDLEFBQXpDLENBQTZCLFNBQVMsR0FBRztJQUV6QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ1QsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDaEIsY0FBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLGNBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRztZQUM5QixjQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRztZQUM1QixJQUFBLG9CQUFtQyxFQUFsQyxnQkFBSyxFQUFFLHNCQUFRLENBQW9CO1lBQzFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixLQUFLLDZCQUFhLENBQUMsTUFBTTtvQkFDdkIsTUFBTSxDQUFDLGNBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDMUQsS0FBSyw2QkFBYSxDQUFDLE9BQU87b0JBQ3hCLE1BQU0sQ0FBQyxjQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNyRTtvQkFDRSxNQUFNLENBQUMsY0FBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsY0FBcUQsQ0FBQztBQUMvRCxDQUFDO0FBekRELGdDQXlEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UmVmZXJlbmNlVHlwZX0gZnJvbSAnLi4vZW51bXMvUmVmZXJlbmNlVHlwZSc7XG5pbXBvcnQge0RFQ09SQVRFX01PREVMfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vaGVscGVycy9mb3JtYXQnO1xuaW1wb3J0IHtpc01vZGVsfSBmcm9tICcuLi9oZWxwZXJzL21peGluJztcbmltcG9ydCB7SURpY3Rpb25hcnl9IGZyb20gJy4uL2ludGVyZmFjZXMvSURpY3Rpb25hcnknO1xuaW1wb3J0IHtJTW9kZWxDb25zdHJ1Y3Rvcn0gZnJvbSAnLi4vaW50ZXJmYWNlcy9JTW9kZWxDb25zdHJ1Y3Rvcic7XG5pbXBvcnQge0lSZWZlcmVuY2VPcHRpb25zfSBmcm9tICcuLi9pbnRlcmZhY2VzL0lSZWZlcmVuY2VPcHRpb25zJztcbmltcG9ydCB7SVR5cGV9IGZyb20gJy4uL2ludGVyZmFjZXMvSVR5cGUnO1xuaW1wb3J0IHtNb2RlbH0gZnJvbSAnLi4vTW9kZWwnO1xuaW1wb3J0IHByb3AgZnJvbSAnLi4vcHJvcCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cE1vZGVsPElNb2RlbCBleHRlbmRzIE1vZGVsLCBJRmllbGRzIGV4dGVuZHMgSURpY3Rpb25hcnk8YW55Pj4oXG4gIEJhc2U6IElNb2RlbENvbnN0cnVjdG9yPElNb2RlbD4sXG4gIHtcbiAgICBmaWVsZHMsXG4gICAgcmVmZXJlbmNlcyxcbiAgICB0eXBlLFxuICAgIGlkQXR0cmlidXRlLFxuICAgIHR5cGVBdHRyaWJ1dGUsXG4gIH06IHtcbiAgICBmaWVsZHM6IElGaWVsZHM7XG4gICAgcmVmZXJlbmNlcz86IElEaWN0aW9uYXJ5PElSZWZlcmVuY2VPcHRpb25zPjtcbiAgICB0eXBlPzogSVR5cGU7XG4gICAgaWRBdHRyaWJ1dGU/OiBzdHJpbmc7XG4gICAgdHlwZUF0dHJpYnV0ZT86IHN0cmluZztcbiAgfSA9IHtmaWVsZHM6IHt9IGFzIElGaWVsZHN9LFxuKSB7XG4gIGNvbnN0IEJhc2VDbGFzcyA9IEJhc2UgYXMgdHlwZW9mIE1vZGVsO1xuXG4gIGlmICghaXNNb2RlbChCYXNlQ2xhc3MpKSB7XG4gICAgdGhyb3cgZXJyb3IoREVDT1JBVEVfTU9ERUwpO1xuICB9XG5cbiAgY2xhc3MgTW9kZWxXaXRoUHJvcHMgZXh0ZW5kcyBCYXNlQ2xhc3Mge31cblxuICBpZiAodHlwZSkge1xuICAgIE1vZGVsV2l0aFByb3BzLnR5cGUgPSB0eXBlO1xuICB9XG5cbiAgaWYgKGlkQXR0cmlidXRlKSB7XG4gICAgcHJvcC5pZGVudGlmaWVyKE1vZGVsV2l0aFByb3BzLnByb3RvdHlwZSwgaWRBdHRyaWJ1dGUpO1xuICB9XG5cbiAgaWYgKHR5cGVBdHRyaWJ1dGUpIHtcbiAgICBwcm9wLnR5cGUoTW9kZWxXaXRoUHJvcHMucHJvdG90eXBlLCB0eXBlQXR0cmlidXRlKTtcbiAgfVxuXG4gIGlmIChmaWVsZHMpIHtcbiAgICBPYmplY3Qua2V5cyhmaWVsZHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgcHJvcC5kZWZhdWx0VmFsdWUoZmllbGRzW2tleV0pKE1vZGVsV2l0aFByb3BzLnByb3RvdHlwZSwga2V5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChyZWZlcmVuY2VzKSB7XG4gICAgT2JqZWN0LmtleXMocmVmZXJlbmNlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBjb25zdCB7bW9kZWwsIHByb3BlcnR5fSA9IHJlZmVyZW5jZXNba2V5XTtcbiAgICAgIHN3aXRjaCAocmVmZXJlbmNlc1trZXldLnR5cGUpIHtcbiAgICAgICAgY2FzZSBSZWZlcmVuY2VUeXBlLlRPX09ORTpcbiAgICAgICAgICByZXR1cm4gcHJvcC50b09uZShtb2RlbCkoTW9kZWxXaXRoUHJvcHMucHJvdG90eXBlLCBrZXkpO1xuICAgICAgICBjYXNlIFJlZmVyZW5jZVR5cGUuVE9fTUFOWTpcbiAgICAgICAgICByZXR1cm4gcHJvcC50b01hbnkobW9kZWwsIHByb3BlcnR5KShNb2RlbFdpdGhQcm9wcy5wcm90b3R5cGUsIGtleSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIHByb3AudG9PbmVPck1hbnkobW9kZWwpKE1vZGVsV2l0aFByb3BzLnByb3RvdHlwZSwga2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBNb2RlbFdpdGhQcm9wcyBhcyBJTW9kZWxDb25zdHJ1Y3RvcjxJTW9kZWwgJiBJRmllbGRzPjtcbn1cbiJdfQ==
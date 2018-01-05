"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReferenceType_1 = require("./enums/ReferenceType");
var storage_1 = require("./services/storage");
/**
 * Set a model property as tracked
 *
 * @template T
 * @param {T} obj Target model
 * @param {string} key Property name
 * @returns {undefined}
 */
function propFn(obj, key) {
    storage_1.storage.addModelDefaultField(obj.constructor, key);
}
exports.default = Object.assign(propFn, {
    /**
     * Set the default value for the model property
     *
     * @param {any} value The default property value
     * @returns {undefined}
     */
    defaultValue: function (value) {
        return function (obj, key) {
            storage_1.storage.addModelDefaultField(obj.constructor, key, value);
        };
    },
    /**
     * Add a reference to a single other model
     *
     * @param {typeof Model} refModel Model type the reference will point to
     * @returns {undefined}
     */
    toOne: function (refModel) {
        return function (obj, key) {
            storage_1.storage.addModelClassReference(obj.constructor, key, {
                model: refModel,
                type: ReferenceType_1.ReferenceType.TO_ONE,
            });
        };
    },
    /**
     * Add a reference to multiple other models
     *
     * @param {typeof Model} refModel Model type the reference will point to
     * @param {string} [property] Use a foreign key from the other model to get this reference (computed back reference)
     * @returns {undefined}
     */
    toMany: function (refModel, property) {
        return function (obj, key) {
            storage_1.storage.addModelClassReference(obj.constructor, key, {
                model: refModel,
                property: property,
                type: ReferenceType_1.ReferenceType.TO_MANY,
            });
        };
    },
    /**
     * Add a reference to a single or multiple other models
     *
     * @param {typeof Model} refModel Model type the reference will point to
     * @returns {undefined}
     */
    toOneOrMany: function (refModel) {
        return function (obj, key) {
            storage_1.storage.addModelClassReference(obj.constructor, key, {
                model: refModel,
                type: ReferenceType_1.ReferenceType.TO_ONE_OR_MANY,
            });
        };
    },
    /**
     * Define the identifier property on the model
     *
     * @param {T} obj Target model
     * @param {string} key Identifier property name
     * @returns {undefined}
     */
    identifier: function (obj, key) {
        storage_1.storage.addModelDefaultField(obj.constructor, key);
        storage_1.storage.setModelClassMetaKey(obj.constructor, 'id', key);
    },
    /**
     * Define the type property on the model
     *
     * @param {T} obj Target model
     * @param {string} key Type property name
     * @returns {undefined}
     */
    type: function (obj, key) {
        storage_1.storage.addModelDefaultField(obj.constructor, key);
        storage_1.storage.setModelClassMetaKey(obj.constructor, 'type', key);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wcm9wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQW9EO0FBRXBELDhDQUEyQztBQUUzQzs7Ozs7OztHQU9HO0FBQ0gsZ0JBQWlDLEdBQU0sRUFBRSxHQUFXO0lBQ2xELGlCQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFdBQTJCLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVELGtCQUFlLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0lBRW5DOzs7OztPQUtHO0lBQ0gsWUFBWSxZQUFDLEtBQVU7UUFDckIsTUFBTSxDQUFDLFVBQWtCLEdBQU0sRUFBRSxHQUFXO1lBQzFDLGlCQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFdBQTJCLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVFLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssWUFBQyxRQUFzQjtRQUMxQixNQUFNLENBQUMsVUFBa0IsR0FBTSxFQUFFLEdBQVc7WUFDMUMsaUJBQU8sQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsV0FBMkIsRUFBRSxHQUFHLEVBQUU7Z0JBQ25FLEtBQUssRUFBRSxRQUFRO2dCQUNmLElBQUksRUFBRSw2QkFBYSxDQUFDLE1BQU07YUFDM0IsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILE1BQU0sWUFBQyxRQUFzQixFQUFFLFFBQWlCO1FBQzlDLE1BQU0sQ0FBQyxVQUFrQixHQUFNLEVBQUUsR0FBVztZQUMxQyxpQkFBTyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxXQUEyQixFQUFFLEdBQUcsRUFBRTtnQkFDbkUsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsUUFBUSxVQUFBO2dCQUNSLElBQUksRUFBRSw2QkFBYSxDQUFDLE9BQU87YUFDNUIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsV0FBVyxZQUFDLFFBQXNCO1FBQ2hDLE1BQU0sQ0FBQyxVQUFrQixHQUFNLEVBQUUsR0FBVztZQUMxQyxpQkFBTyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxXQUEyQixFQUFFLEdBQUcsRUFBRTtnQkFDbkUsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsSUFBSSxFQUFFLDZCQUFhLENBQUMsY0FBYzthQUNuQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsVUFBVSxFQUFWLFVBQTRCLEdBQU0sRUFBRSxHQUFXO1FBQzdDLGlCQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFdBQTJCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbkUsaUJBQU8sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsV0FBMkIsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILElBQUksRUFBSixVQUFzQixHQUFNLEVBQUUsR0FBVztRQUN2QyxpQkFBTyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxXQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25FLGlCQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFdBQTJCLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzdFLENBQUM7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1JlZmVyZW5jZVR5cGV9IGZyb20gJy4vZW51bXMvUmVmZXJlbmNlVHlwZSc7XG5pbXBvcnQge01vZGVsfSBmcm9tICcuL01vZGVsJztcbmltcG9ydCB7c3RvcmFnZX0gZnJvbSAnLi9zZXJ2aWNlcy9zdG9yYWdlJztcblxuLyoqXG4gKiBTZXQgYSBtb2RlbCBwcm9wZXJ0eSBhcyB0cmFja2VkXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7VH0gb2JqIFRhcmdldCBtb2RlbFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBQcm9wZXJ0eSBuYW1lXG4gKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICovXG5mdW5jdGlvbiBwcm9wRm48VCBleHRlbmRzIE1vZGVsPihvYmo6IFQsIGtleTogc3RyaW5nKSB7XG4gIHN0b3JhZ2UuYWRkTW9kZWxEZWZhdWx0RmllbGQob2JqLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBNb2RlbCwga2V5KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmFzc2lnbihwcm9wRm4sIHtcblxuICAvKipcbiAgICogU2V0IHRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGUgbW9kZWwgcHJvcGVydHlcbiAgICpcbiAgICogQHBhcmFtIHthbnl9IHZhbHVlIFRoZSBkZWZhdWx0IHByb3BlcnR5IHZhbHVlXG4gICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAqL1xuICBkZWZhdWx0VmFsdWUodmFsdWU6IGFueSkge1xuICAgIHJldHVybiA8VCBleHRlbmRzIE1vZGVsPihvYmo6IFQsIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICBzdG9yYWdlLmFkZE1vZGVsRGVmYXVsdEZpZWxkKG9iai5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgTW9kZWwsIGtleSwgdmFsdWUpO1xuICAgIH07XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlZmVyZW5jZSB0byBhIHNpbmdsZSBvdGhlciBtb2RlbFxuICAgKlxuICAgKiBAcGFyYW0ge3R5cGVvZiBNb2RlbH0gcmVmTW9kZWwgTW9kZWwgdHlwZSB0aGUgcmVmZXJlbmNlIHdpbGwgcG9pbnQgdG9cbiAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICovXG4gIHRvT25lKHJlZk1vZGVsOiB0eXBlb2YgTW9kZWwpIHtcbiAgICByZXR1cm4gPFQgZXh0ZW5kcyBNb2RlbD4ob2JqOiBULCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgc3RvcmFnZS5hZGRNb2RlbENsYXNzUmVmZXJlbmNlKG9iai5jb25zdHJ1Y3RvciBhcyB0eXBlb2YgTW9kZWwsIGtleSwge1xuICAgICAgICBtb2RlbDogcmVmTW9kZWwsXG4gICAgICAgIHR5cGU6IFJlZmVyZW5jZVR5cGUuVE9fT05FLFxuICAgICAgfSk7XG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICogQWRkIGEgcmVmZXJlbmNlIHRvIG11bHRpcGxlIG90aGVyIG1vZGVsc1xuICAgKlxuICAgKiBAcGFyYW0ge3R5cGVvZiBNb2RlbH0gcmVmTW9kZWwgTW9kZWwgdHlwZSB0aGUgcmVmZXJlbmNlIHdpbGwgcG9pbnQgdG9cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtwcm9wZXJ0eV0gVXNlIGEgZm9yZWlnbiBrZXkgZnJvbSB0aGUgb3RoZXIgbW9kZWwgdG8gZ2V0IHRoaXMgcmVmZXJlbmNlIChjb21wdXRlZCBiYWNrIHJlZmVyZW5jZSlcbiAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICovXG4gIHRvTWFueShyZWZNb2RlbDogdHlwZW9mIE1vZGVsLCBwcm9wZXJ0eT86IHN0cmluZykge1xuICAgIHJldHVybiA8VCBleHRlbmRzIE1vZGVsPihvYmo6IFQsIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICBzdG9yYWdlLmFkZE1vZGVsQ2xhc3NSZWZlcmVuY2Uob2JqLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBNb2RlbCwga2V5LCB7XG4gICAgICAgIG1vZGVsOiByZWZNb2RlbCxcbiAgICAgICAgcHJvcGVydHksXG4gICAgICAgIHR5cGU6IFJlZmVyZW5jZVR5cGUuVE9fTUFOWSxcbiAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlZmVyZW5jZSB0byBhIHNpbmdsZSBvciBtdWx0aXBsZSBvdGhlciBtb2RlbHNcbiAgICpcbiAgICogQHBhcmFtIHt0eXBlb2YgTW9kZWx9IHJlZk1vZGVsIE1vZGVsIHR5cGUgdGhlIHJlZmVyZW5jZSB3aWxsIHBvaW50IHRvXG4gICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAqL1xuICB0b09uZU9yTWFueShyZWZNb2RlbDogdHlwZW9mIE1vZGVsKSB7XG4gICAgcmV0dXJuIDxUIGV4dGVuZHMgTW9kZWw+KG9iajogVCwga2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIHN0b3JhZ2UuYWRkTW9kZWxDbGFzc1JlZmVyZW5jZShvYmouY29uc3RydWN0b3IgYXMgdHlwZW9mIE1vZGVsLCBrZXksIHtcbiAgICAgICAgbW9kZWw6IHJlZk1vZGVsLFxuICAgICAgICB0eXBlOiBSZWZlcmVuY2VUeXBlLlRPX09ORV9PUl9NQU5ZLFxuICAgICAgfSk7XG4gICAgfTtcbiAgfSxcblxuICAvKipcbiAgICogRGVmaW5lIHRoZSBpZGVudGlmaWVyIHByb3BlcnR5IG9uIHRoZSBtb2RlbFxuICAgKlxuICAgKiBAcGFyYW0ge1R9IG9iaiBUYXJnZXQgbW9kZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBJZGVudGlmaWVyIHByb3BlcnR5IG5hbWVcbiAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICovXG4gIGlkZW50aWZpZXI8VCBleHRlbmRzIE1vZGVsPihvYmo6IFQsIGtleTogc3RyaW5nKSB7XG4gICAgc3RvcmFnZS5hZGRNb2RlbERlZmF1bHRGaWVsZChvYmouY29uc3RydWN0b3IgYXMgdHlwZW9mIE1vZGVsLCBrZXkpO1xuICAgIHN0b3JhZ2Uuc2V0TW9kZWxDbGFzc01ldGFLZXkob2JqLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBNb2RlbCwgJ2lkJywga2V5KTtcbiAgfSxcblxuICAvKipcbiAgICogRGVmaW5lIHRoZSB0eXBlIHByb3BlcnR5IG9uIHRoZSBtb2RlbFxuICAgKlxuICAgKiBAcGFyYW0ge1R9IG9iaiBUYXJnZXQgbW9kZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUeXBlIHByb3BlcnR5IG5hbWVcbiAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICovXG4gIHR5cGU8VCBleHRlbmRzIE1vZGVsPihvYmo6IFQsIGtleTogc3RyaW5nKSB7XG4gICAgc3RvcmFnZS5hZGRNb2RlbERlZmF1bHRGaWVsZChvYmouY29uc3RydWN0b3IgYXMgdHlwZW9mIE1vZGVsLCBrZXkpO1xuICAgIHN0b3JhZ2Uuc2V0TW9kZWxDbGFzc01ldGFLZXkob2JqLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBNb2RlbCwgJ3R5cGUnLCBrZXkpO1xuICB9LFxufSk7XG4iXX0=
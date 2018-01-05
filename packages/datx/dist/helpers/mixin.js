"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collection_1 = require("../Collection");
var Model_1 = require("../Model");
/**
 * Check if a class is of a certain type
 *
 * @export
 * @param {Function} obj Class to check
 * @param {Function} type Type to check
 * @returns {boolean} Class is of the given type
 */
// tslint:disable-next-line:ban-types
function isOfType(obj, type) {
    var model = obj;
    while (model) {
        if (model === type) {
            return true;
        }
        model = Object.getPrototypeOf(model);
    }
    return false;
}
/**
 * Check if a class is a model
 *
 * @export
 * @param {(typeof Model | typeof Collection)} obj Class to check
 * @returns {boolean} Class is a model
 */
function isModel(obj) {
    return isOfType(obj, Model_1.Model);
}
exports.isModel = isModel;
/**
 * Check if a class is a collection
 *
 * @export
 * @param {(typeof Model | typeof Collection)} obj Class to check
 * @returns {boolean} Class is a collection
 */
function isCollection(obj) {
    return isOfType(obj, Collection_1.Collection);
}
exports.isCollection = isCollection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWl4aW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9taXhpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRDQUF5QztBQUN6QyxrQ0FBK0I7QUFFL0I7Ozs7Ozs7R0FPRztBQUNILHFDQUFxQztBQUNyQyxrQkFBa0IsR0FBYSxFQUFFLElBQWM7SUFDN0MsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO0lBQ2hCLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELEtBQUssR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILGlCQUF3QixHQUFxQztJQUMzRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxhQUFLLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRkQsMEJBRUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxzQkFBNkIsR0FBcUM7SUFDaEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsdUJBQVUsQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUFGRCxvQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29sbGVjdGlvbn0gZnJvbSAnLi4vQ29sbGVjdGlvbic7XG5pbXBvcnQge01vZGVsfSBmcm9tICcuLi9Nb2RlbCc7XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBjbGFzcyBpcyBvZiBhIGNlcnRhaW4gdHlwZVxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9iaiBDbGFzcyB0byBjaGVja1xuICogQHBhcmFtIHtGdW5jdGlvbn0gdHlwZSBUeXBlIHRvIGNoZWNrXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gQ2xhc3MgaXMgb2YgdGhlIGdpdmVuIHR5cGVcbiAqL1xuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmJhbi10eXBlc1xuZnVuY3Rpb24gaXNPZlR5cGUob2JqOiBGdW5jdGlvbiwgdHlwZTogRnVuY3Rpb24pOiBib29sZWFuIHtcbiAgbGV0IG1vZGVsID0gb2JqO1xuICB3aGlsZSAobW9kZWwpIHtcbiAgICBpZiAobW9kZWwgPT09IHR5cGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBtb2RlbCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihtb2RlbCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgY2xhc3MgaXMgYSBtb2RlbFxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7KHR5cGVvZiBNb2RlbCB8IHR5cGVvZiBDb2xsZWN0aW9uKX0gb2JqIENsYXNzIHRvIGNoZWNrXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gQ2xhc3MgaXMgYSBtb2RlbFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNb2RlbChvYmo6IHR5cGVvZiBNb2RlbCB8IHR5cGVvZiBDb2xsZWN0aW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc09mVHlwZShvYmosIE1vZGVsKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIGNsYXNzIGlzIGEgY29sbGVjdGlvblxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7KHR5cGVvZiBNb2RlbCB8IHR5cGVvZiBDb2xsZWN0aW9uKX0gb2JqIENsYXNzIHRvIGNoZWNrXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gQ2xhc3MgaXMgYSBjb2xsZWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbGxlY3Rpb24ob2JqOiB0eXBlb2YgTW9kZWwgfCB0eXBlb2YgQ29sbGVjdGlvbik6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNPZlR5cGUob2JqLCBDb2xsZWN0aW9uKTtcbn1cbiJdfQ==
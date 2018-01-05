"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var consts_1 = require("./consts");
var init_1 = require("./helpers/model/init");
var Model = /** @class */ (function () {
    function Model(rawData, collection) {
        if (rawData === void 0) { rawData = {}; }
        init_1.initModel(this, rawData, collection);
    }
    /**
     * Function used to preprocess the model input data. Called during the model initialization
     *
     * @static
     * @param {object} data Input data
     * @returns Target model data
     * @memberof Model
     */
    Model.preprocess = function (data) {
        return data;
    };
    /**
     * Method used for generating of automatic model ids
     *
     * @static
     * @returns {IIdentifier} A new model id
     * @memberof Model
     */
    Model.getAutoId = function () {
        return --this.autoIdValue;
    };
    /**
     * Model type used for serialization
     *
     * @static
     * @type {IType}
     * @memberof Model
     */
    Model.type = consts_1.DEFAULT_TYPE;
    /**
     * Current autoincrement value used for automatic id generation
     *
     * @static
     * @type {number}
     * @memberof Model
     */
    Model.autoIdValue = 0;
    return Model;
}());
exports.Model = Model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBc0M7QUFDdEMsNkNBQStDO0FBSy9DO0lBMkNFLGVBQVksT0FBdUIsRUFBRSxVQUF1QjtRQUFoRCx3QkFBQSxFQUFBLFlBQXVCO1FBQ2pDLGdCQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBekJEOzs7Ozs7O09BT0c7SUFDVyxnQkFBVSxHQUF4QixVQUF5QixJQUFZO1FBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ1csZUFBUyxHQUF2QjtRQUNFLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQXZDRDs7Ozs7O09BTUc7SUFDVyxVQUFJLEdBQVUscUJBQVksQ0FBQztJQUV6Qzs7Ozs7O09BTUc7SUFDVyxpQkFBVyxHQUFXLENBQUMsQ0FBQztJQTRCeEMsWUFBQztDQUFBLEFBOUNELElBOENDO0FBOUNZLHNCQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb2xsZWN0aW9ufSBmcm9tICcuL0NvbGxlY3Rpb24nO1xuaW1wb3J0IHtERUZBVUxUX1RZUEV9IGZyb20gJy4vY29uc3RzJztcbmltcG9ydCB7aW5pdE1vZGVsfSBmcm9tICcuL2hlbHBlcnMvbW9kZWwvaW5pdCc7XG5pbXBvcnQge0lEaWN0aW9uYXJ5fSBmcm9tICcuL2ludGVyZmFjZXMvSURpY3Rpb25hcnknO1xuaW1wb3J0IHtJUmF3TW9kZWx9IGZyb20gJy4vaW50ZXJmYWNlcy9JUmF3TW9kZWwnO1xuaW1wb3J0IHtJVHlwZX0gZnJvbSAnLi9pbnRlcmZhY2VzL0lUeXBlJztcblxuZXhwb3J0IGNsYXNzIE1vZGVsIHtcblxuICAvKipcbiAgICogTW9kZWwgdHlwZSB1c2VkIGZvciBzZXJpYWxpemF0aW9uXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQHR5cGUge0lUeXBlfVxuICAgKiBAbWVtYmVyb2YgTW9kZWxcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgdHlwZTogSVR5cGUgPSBERUZBVUxUX1RZUEU7XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgYXV0b2luY3JlbWVudCB2YWx1ZSB1c2VkIGZvciBhdXRvbWF0aWMgaWQgZ2VuZXJhdGlvblxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBtZW1iZXJvZiBNb2RlbFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhdXRvSWRWYWx1ZTogbnVtYmVyID0gMDtcblxuICAvKipcbiAgICogRnVuY3Rpb24gdXNlZCB0byBwcmVwcm9jZXNzIHRoZSBtb2RlbCBpbnB1dCBkYXRhLiBDYWxsZWQgZHVyaW5nIHRoZSBtb2RlbCBpbml0aWFsaXphdGlvblxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIElucHV0IGRhdGFcbiAgICogQHJldHVybnMgVGFyZ2V0IG1vZGVsIGRhdGFcbiAgICogQG1lbWJlcm9mIE1vZGVsXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHByZXByb2Nlc3MoZGF0YTogb2JqZWN0KSB7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHVzZWQgZm9yIGdlbmVyYXRpbmcgb2YgYXV0b21hdGljIG1vZGVsIGlkc1xuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEByZXR1cm5zIHtJSWRlbnRpZmllcn0gQSBuZXcgbW9kZWwgaWRcbiAgICogQG1lbWJlcm9mIE1vZGVsXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldEF1dG9JZCgpIHtcbiAgICByZXR1cm4gLS10aGlzLmF1dG9JZFZhbHVlO1xuICB9XG5cbiAgY29uc3RydWN0b3IocmF3RGF0YTogSVJhd01vZGVsID0ge30sIGNvbGxlY3Rpb24/OiBDb2xsZWN0aW9uKSB7XG4gICAgaW5pdE1vZGVsKHRoaXMsIHJhd0RhdGEsIGNvbGxlY3Rpb24pO1xuICB9XG59XG4iXX0=
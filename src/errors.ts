export const UNDEFINED_TYPE = 'The type needs to be defined if the object is not an instance of the model.';
export const UNDEFINED_MODEL = 'No model is defined for the type ${type}.';
export const NOT_A_CLONE = 'The given model is not a clone.';
export const MODEL_EXISTS = 'Model already exists, please update it instead.';
export const REF_NEEDS_COLLECTION = 'The model needs to be in one of collections to be referenceable';
export const REF_SINGLE = 'The reference ${key} can\'t be an array of values.';
export const REF_ARRAY = 'The reference ${key} must be an array of values.';
export const NO_REFS = 'You should save this value as a reference.';
export const COLLECTION_DESTROYED = 'Can\'t modify a destroyed collection';
export const BACK_REF_READ_ONLY = 'Back references are read only';
export const ID_READONLY = 'Model ID can\'t be updated directly. Use the `updateModelId` helper function instead.';
export const TYPE_READONLY = 'Model type can\'t be changed after initialization.';

export const DECORATE_MODEL = 'This mixin can only decorate models';
export const DECORATE_COLLECTION = 'This mixin can only decorate collections';

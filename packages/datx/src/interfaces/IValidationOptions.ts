export interface IValidationOptions {
  /**
   * If true, will return an error if extra keys exist in the data
   *
   * @default true
   */
  strict?: boolean;

  /**
   * If true, will throw an error if the data is invalid (with only the first found issue)
   *
   * @default true
   */
  throw?: boolean;

  /**
   * If true, will check a plain object instead of a resource
   *
   * @default false
   */
  plain?: boolean;
}

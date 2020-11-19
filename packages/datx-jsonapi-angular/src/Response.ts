import { Response as PromiseResponse, fetchLink } from 'datx-jsonapi';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { Observable } from 'rxjs';
import { observableWrapper } from './helpers/wrapper';

type ILink = string | { href: string; meta: Record<string, any> };
type IAsync<T extends IJsonapiModel> = Observable<Response<T>>;

export class Response<T extends IJsonapiModel = IJsonapiModel> extends PromiseResponse<any, IAsync<T>> {
  /**
   * Function called when a link is being fetched. The returned value is cached
   *
   * @protected
   * @param {string} name Link name
   * @returns Observable that resolves with a Response object
   *
   * @memberOf Response
   */
  protected __fetchLink(name: string): () => Observable<Response<T>> {
    if (!this.__cache[name]) {
      const link: ILink | null = this.links && name in this.links ? this.links[name] : null;

      if (link) {
        const options = Object.assign({}, this.__internal.options);

        options.networkConfig = options.networkConfig || {};
        options.networkConfig.headers = this.requestHeaders;
        this.__cache[name] = (): Observable<Response<T>> => {
          return observableWrapper((rxOptions): any => {
            return fetchLink<any>(link, this.collection, Object.assign({}, options, rxOptions), this.views);
          });
        }
      }
    }

    return this.__cache[name];
  }
}

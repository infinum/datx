import { InjectionToken } from '@angular/core';
import { IConfigType } from '@datx/jsonapi';

export const DATX_CONFIG = new InjectionToken<Partial<IConfigType>>('DATX_CONFIG');

// Use any because there is currently no good way to type the decorated application-specific Collection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const APP_COLLECTION = new InjectionToken<any>('APP_COLLECTION');

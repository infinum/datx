import { InjectionToken } from '@angular/core';
import { IDatxConfig } from './interfaces/IDatxConfig';

export const DATX_CONFIG = new InjectionToken<Partial<IDatxConfig>>('DATX_CONFIG');

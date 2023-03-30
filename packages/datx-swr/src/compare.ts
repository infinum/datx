import { getResponseRawData } from '@datx/jsonapi';
import { SWRConfiguration } from 'swr';

export const getResponseCompare =
  (compare: Exclude<SWRConfiguration['compare'], undefined>) => (a, b) => {
    const aRawResponseData = getResponseRawData(a) || a;
    const bRawResponseData = getResponseRawData(b) || b;

    return compare(aRawResponseData, bRawResponseData);
  };

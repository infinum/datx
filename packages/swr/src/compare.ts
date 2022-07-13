import { SWRConfiguration } from 'swr';

export const getResponseCompare =
  (compare: Exclude<SWRConfiguration['compare'], undefined>) => (a, b) => {
    // @ts-ignore
    const aRawResponseData = a?.__internal?.response?.data || a;
    // @ts-ignore
    const bRawResponseData = b?.__internal?.response?.data || b;

    return compare(aRawResponseData, bRawResponseData);
  };

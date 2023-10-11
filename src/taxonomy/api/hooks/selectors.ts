import * as api from './api';
import { TaxonomyListData } from '../types';

export const useTaxonomyListDataResponse = (): TaxonomyListData | undefined => {
    const response = api.useTaxonomyListData()
    if (response.status === 'success') {
        return response.data.data;
    }
    return undefined;
};

export const useIsTaxonomyListDataLoaded = (): boolean => (
    api.useTaxonomyListData().status === 'success'
);

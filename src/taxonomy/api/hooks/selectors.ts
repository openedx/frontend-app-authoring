import * as api from './api';
import * as types from '../types';

export const useTaxonomyListDataResponse = (): types.TaxonomyListData => {
    const response = api.useTaxonomyListData()
    if (response.status === 'success') {
        return response.data.data;
    }
    return undefined;
};

export const useIsTaxonomyListDataLoaded = (): boolean => (
    api.useTaxonomyListData().status === 'success'
);

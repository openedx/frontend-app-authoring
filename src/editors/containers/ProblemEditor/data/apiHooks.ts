import { useMutation } from '@tanstack/react-query';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import api from '@src/editors/data/services/cms/api';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const useValidateInputBlock = () => useMutation({
  mutationFn: async (title : string) => {
    try {
      const res = await api.validateBlockNumericInput({ studioEndpointUrl: `${getApiBaseUrl()}`, data: { formula: title } });
      return camelCaseObject(res.data);
    } catch (err: any) {
      return {
        isValid: false,
        error: err.response?.data?.error ?? 'Unknown error',
      };
    }
  },
});

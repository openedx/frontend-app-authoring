import { useMutation } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';
import api from '@src/editors/data/services/cms/api';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const useValidateInputBlock = () => useMutation({
  mutationFn: async ({ title }) => {
    try {
      const res = await api.validateBlockNumericInput({ studioEndpointUrl: `${getApiBaseUrl()}`, data: { formula: title } });
      return res.data;
    } catch (err) {
      return {
        is_valid: false,
        error: err.response?.data?.error ?? 'Unknown error',
      };
    }
  },
});

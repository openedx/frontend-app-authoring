import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import api from '@src/editors/data/services/cms/api';
import { useValidateInputBlock } from './apiHooks';

// Mock external dependencies
jest.mock('@edx/frontend-platform');
jest.mock('@src/editors/data/services/cms/api', () => ({
  validateBlockNumericInput: jest.fn(),
}));

const mockedCamelCaseObject = jest.mocked(camelCaseObject);
const mockedGetConfig = jest.mocked(getConfig);
const mockedValidateBlockNumericInput = jest.mocked(api.validateBlockNumericInput);

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  return wrapper;
};

describe('useValidateInputBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetConfig.mockReturnValue({
      STUDIO_BASE_URL: 'http://studio.local.openedx.io:8001',
    });
  });

  test('should return camelCase data on successful API call', async () => {
    const mockResponse = {
      data: { is_valid: true, result: 'success' },
    } as any;
    const mockCamelCaseResult = { isValid: true, result: 'success' };

    mockedValidateBlockNumericInput.mockResolvedValue(Promise.resolve(mockResponse));
    mockedCamelCaseObject.mockReturnValue(mockCamelCaseResult);

    const { result } = renderHook(() => useValidateInputBlock(), {
      wrapper: createWrapper(),
    });

    const testFormula = 'x + 1';
    result.current.mutate(testFormula);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedValidateBlockNumericInput).toHaveBeenCalledWith({
      studioEndpointUrl: 'http://studio.local.openedx.io:8001',
      data: { formula: testFormula },
    });
    expect(mockedCamelCaseObject).toHaveBeenCalledWith(mockResponse.data);
    expect(result.current.data).toEqual({ isValid: true, result: 'success' });
  });
});

import { camelCaseObject } from '@edx/frontend-platform';

import { createAxiosError } from '@src/testUtils';
import * as api from './api';
import { generateGetStudioHomeLibrariesApiResponse } from '../factories/mockApiResponses';

/**
 * Mock for `getContentLibraryV2List()`
 */
export const mockGetStudioHomeLibraries = {
  applyMock: () => jest.spyOn(api, 'getStudioHomeLibraries').mockResolvedValue(
    camelCaseObject(generateGetStudioHomeLibrariesApiResponse()),
  ),
  applyMockError: () => jest.spyOn(api, 'getStudioHomeLibraries').mockRejectedValue(
    createAxiosError({ code: 500, message: 'Internal Error.', path: `${api.getStudioHomeApiUrl()}/libraries` }),
  ),
  applyMockLoading: () => jest.spyOn(api, 'getStudioHomeLibraries').mockResolvedValue(
    new Promise(() => {}),
  ),
  applyMockEmpty: () => jest.spyOn(api, 'getStudioHomeLibraries').mockResolvedValue({
    libraries: [],
  }),
};

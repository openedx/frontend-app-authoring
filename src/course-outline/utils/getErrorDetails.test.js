import { getErrorDetails } from './getErrorDetails';
import { API_ERROR_TYPES } from '../constants';

describe('getErrorDetails', () => {
  it('should handle 403 status error', () => {
    const error = { response: { data: 'some data', status: 403 } };
    const result = getErrorDetails(error);
    expect(result).toEqual({ dismissible: false, status: 403, type: API_ERROR_TYPES.forbidden });
  });

  it('should handle response with data', () => {
    const error = { response: { data: 'some data', status: 500 } };
    const result = getErrorDetails(error);
    expect(result).toEqual({
      dismissible: true, data: '"some data"', status: 500, type: API_ERROR_TYPES.serverError,
    });
  });

  it('should handle response with HTML data', () => {
    const error = { response: { data: '<html>error</html>', status: 500 } };
    const result = getErrorDetails(error);
    expect(result).toEqual({ dismissible: true, status: 500, type: API_ERROR_TYPES.serverError });
  });

  it('should handle request error', () => {
    const error = { request: {} };
    const result = getErrorDetails(error);
    expect(result).toEqual({ dismissible: true, type: API_ERROR_TYPES.networkError });
  });

  it('should handle unknown error', () => {
    const error = { message: 'Unknown error' };
    const result = getErrorDetails(error);
    expect(result).toEqual({ dismissible: true, type: API_ERROR_TYPES.unknown, data: 'Unknown error' });
  });
});

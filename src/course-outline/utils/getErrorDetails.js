import { API_ERROR_TYPES } from '../constants';

export const getErrorDetails = (error, dismissible = true) => {
  const errorInfo = { dismissible };
  if (error.response?.status === 403) {
    // For 403 status the error shouldn't be dismissible
    errorInfo.dismissible = false;
    errorInfo.type = API_ERROR_TYPES.forbidden;
    errorInfo.status = error.response.status;
  } else if (error.response?.data) {
    const { data } = error.response;
    if ((typeof data === 'string' && !data.includes('</html>')) || typeof data === 'object') {
      errorInfo.data = JSON.stringify(data);
    }
    errorInfo.status = error.response.status;
    errorInfo.type = API_ERROR_TYPES.serverError;
  } else if (error.request) {
    errorInfo.type = API_ERROR_TYPES.networkError;
  } else {
    errorInfo.type = API_ERROR_TYPES.unknown;
    errorInfo.data = error.message;
  }
  return errorInfo;
};

/**
 * Normalizes, and rethrows, errors that are returned from the HTTP client.
 * @param error
 */
// eslint-disable-next-line import/prefer-default-export
export function normalizeErrors(error) {
  const apiError = Object.create(error);
  let errorData;
  try {
    errorData = JSON.parse(error.customAttributes.httpErrorResponseData);
  } catch {
    apiError.fields = null;
    // Empty message will trigger a default error message in the template.
    apiError.message = '';
    throw apiError;
  }
  // Default Django REST error text slot. Used for things like the
  // default 'not found' response from get_object_or_404.
  if (errorData.detail) {
    apiError.fields = null;
    apiError.message = errorData.detail;
  } else if (typeof errorData === 'string') {
    // This is an error not from Django REST. Some part of the stack is unaware it should be sending back JSON.
    apiError.fields = null;
    apiError.message = '';
  } else if (Array.isArray(errorData)) {
    // Error is non field-bound ValidationError on the backend.
    apiError.fields = null;
    apiError.message = errorData.join('. ');
  } else {
    // We have per-field error messages.
    apiError.fields = errorData;
    apiError.message = null;
  }
  throw apiError;
}

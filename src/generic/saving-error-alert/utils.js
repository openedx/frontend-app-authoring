import { RequestStatus } from '../../data/constants';

const handleResponseErrors = (error, dispatch, savingStatusFunction) => {
  let errorMessage = '';

  try {
    const {
      customAttributes: { httpErrorResponseData },
    } = error;
    const parsedData = JSON.parse(httpErrorResponseData);
    errorMessage = parsedData?.error || errorMessage;
  } catch (err) {
    errorMessage = '';
  }

  dispatch(
    savingStatusFunction({
      status: RequestStatus.FAILED,
      errorMessage,
    }),
  );
  return false;
};

export { handleResponseErrors };

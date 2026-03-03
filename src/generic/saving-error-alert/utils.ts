/* eslint-disable import/no-extraneous-dependencies */
import { AxiosError } from 'axios';
import { RequestStatus } from '@src/data/constants';

export const handleResponseErrors = (error: any, dispatch?: Function, savingStatusFunction?: Function) => {
  let errorMessage = '';

  try {
    const {
      customAttributes: { httpErrorResponseData },
    } = error;
    const parsedData = JSON.parse(httpErrorResponseData);
    errorMessage = parsedData?.error || errorMessage;
  } catch {
    errorMessage = '';
  }

  if (dispatch && savingStatusFunction) {
    dispatch(
      savingStatusFunction({
        status: RequestStatus.FAILED,
        errorMessage,
      }),
    );
  }

  return false;
};

export const getMessageFromAxiosError = (error: AxiosError) => {
  let errorMessage: string | undefined;
  try {
    // @ts-ignore
    errorMessage = error.response?.data?.error;
  } catch {
    errorMessage = undefined;
  }

  return errorMessage;
};

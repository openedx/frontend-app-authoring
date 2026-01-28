/* eslint-disable max-len */
import { createSelector } from '@reduxjs/toolkit';
import type { DeprecatedReduxState } from '@src/store';

export const getLoadingStatus = (state: DeprecatedReduxState) => state.certificates.loadingStatus;
export const getSavingStatus = (state: DeprecatedReduxState) => state.certificates.savingStatus;
export const getSavingImageStatus = (state: DeprecatedReduxState) => state.certificates.savingImageStatus;
export const getErrorMessage = (state: DeprecatedReduxState) => state.certificates.errorMessage;
// Commenting this one out as it seems to be unused:
// export const getSendRequestErrors = (state: DeprecatedReduxState) => state.certificates.sendRequestErrors.developer_message;
export const getCertificates = (state: DeprecatedReduxState) => state.certificates.certificatesData.certificates;
export const getHasCertificateModes = (state: DeprecatedReduxState) => state.certificates.certificatesData.hasCertificateModes;
export const getCourseModes = (state: DeprecatedReduxState) => state.certificates.certificatesData.courseModes;
export const getCertificateActivationUrl = (state: DeprecatedReduxState) => state.certificates.certificatesData.certificateActivationHandlerUrl;
export const getCertificateWebViewUrl = (state: DeprecatedReduxState) => state.certificates.certificatesData.certificateWebViewUrl;
export const getIsCertificateActive = (state: DeprecatedReduxState) => state.certificates.certificatesData.isActive;
export const getComponentMode = (state: DeprecatedReduxState) => state.certificates.componentMode;
export const getCourseNumber = (state: DeprecatedReduxState) => state.certificates.certificatesData.courseNumber;
export const getCourseNumberOverride = (state: DeprecatedReduxState) => state.certificates.certificatesData.courseNumberOverride;
export const getCourseTitle = (state: DeprecatedReduxState) => state.certificates.certificatesData.courseTitle;

export const getHasCertificates = createSelector(
  [getCertificates],
  (certificates) => certificates && certificates.length > 0,
);

import { createSelector } from '@reduxjs/toolkit';

export const getLoadingStatus = (state) => state.certificates.loadingStatus;
export const getSavingStatus = (state) => state.certificates.savingStatus;
export const getSavingImageStatus = (state) => state.certificates.savingImageStatus;
export const getErrorMessage = (state) => state.certificates.errorMessage;
export const getSendRequestErrors = (state) => state.certificates.sendRequestErrors.developer_message;
export const getCertificates = state => state.certificates.certificatesData.certificates;
export const getHasCertificateModes = state => state.certificates.certificatesData.hasCertificateModes;
export const getCourseModes = state => state.certificates.certificatesData.courseModes;
export const getCertificateActivationUrl = state => state.certificates.certificatesData.certificateActivationHandlerUrl;
export const getCertificateWebViewUrl = state => state.certificates.certificatesData.certificateWebViewUrl;
export const getIsCertificateActive = state => state.certificates.certificatesData.isActive;
export const getComponentMode = state => state.certificates.componentMode;
export const getCourseNumber = state => state.certificates.certificatesData.courseNumber;
export const getCourseNumberOverride = state => state.certificates.certificatesData.courseNumberOverride;
export const getCourseTitle = state => state.certificates.certificatesData.courseTitle;

export const getHasCertificates = createSelector(
  [getCertificates],
  (certificates) => certificates && certificates.length > 0,
);

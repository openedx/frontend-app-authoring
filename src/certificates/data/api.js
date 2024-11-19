import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { prepareCertificatePayload } from '../utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getCertificatesApiUrl = (courseId) => `${getApiBaseUrl()}/api/contentstore/v1/certificates/${courseId}`;
export const getCertificateApiUrl = (courseId) => `${getApiBaseUrl()}/certificates/${courseId}`;
export const getUpdateCertificateApiUrl = (courseId, certificateId) => `${getCertificateApiUrl(courseId)}/${certificateId}`;
export const getUpdateCertificateActiveStatusApiUrl = (path) => `${getApiBaseUrl()}${path}`;

/**
 * Gets certificates for a course.
 * @param {string} courseId
 * @returns {Promise<Object>}
 */
export async function getCertificates(courseId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCertificatesApiUrl(courseId));

  return camelCaseObject(data);
}

/**
 * Create course certificate.
 * @param {string} courseId
 * @param {object} certificatesData
 * @returns {Promise<Object>}
 */

export async function createCertificate(courseId, certificatesData) {
  const { data } = await getAuthenticatedHttpClient()
    .post(
      getCertificateApiUrl(courseId),
      prepareCertificatePayload(certificatesData),
    );

  return camelCaseObject(data);
}

/**
 * Update course certificate.
 * @param {string} courseId
 * @param {object} certificateData
 * @returns {Promise<Object>}
 */
export async function updateCertificate(courseId, certificateData) {
  const { data } = await getAuthenticatedHttpClient()
    .post(
      getUpdateCertificateApiUrl(courseId, certificateData.id),
      prepareCertificatePayload(certificateData),
    );
  return camelCaseObject(data);
}

/**
 * Delete course certificate.
 * @param {string} courseId
 * @param {object} certificateId
 * @returns {Promise<Object>}
 */
export async function deleteCertificate(courseId, certificateId) {
  const { data } = await getAuthenticatedHttpClient()
    .delete(
      getUpdateCertificateApiUrl(courseId, certificateId),
    );
  return data;
}

/**
 * Activate/deactivate course certificate.
 * @param {string} courseId
 * @param {object} activationStatus
 * @returns {Promise<Object>}
 */
export async function updateActiveStatus(path, activationStatus) {
  const body = {
    is_active: activationStatus,
  };

  const { data } = await getAuthenticatedHttpClient()
    .post(
      getUpdateCertificateActiveStatusApiUrl(path),
      body,
    );
  return camelCaseObject(data);
}

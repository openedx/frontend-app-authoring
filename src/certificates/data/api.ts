import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { prepareCertificatePayload } from '../utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getCertificatesApiUrl = (courseId: string) => `${getApiBaseUrl()}/api/contentstore/v1/certificates/${courseId}`;
export const getCertificateApiUrl = (courseId: string) => `${getApiBaseUrl()}/certificates/${courseId}`;
export const getUpdateCertificateApiUrl = (courseId: string, certificateId: number) => `${getCertificateApiUrl(courseId)}/${certificateId}`;
export const getUpdateCertificateActiveStatusApiUrl = (path: string) => `${getApiBaseUrl()}${path}`;

/**
 * Gets certificates for a course.
 */
export async function getCertificates(courseId: string): Promise<Record<string, any>> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCertificatesApiUrl(courseId));

  return camelCaseObject(data);
}

/**
 * Create course certificate.
 */
export async function createCertificate(
  courseId: string,
  certificatesData: Record<string, any>,
): Promise<Record<string, any>> {
  const { data } = await getAuthenticatedHttpClient()
    .post(
      getCertificateApiUrl(courseId),
      prepareCertificatePayload(certificatesData),
    );
  /* istanbul ignore next */
  return camelCaseObject(data);
}

/**
 * Update course certificate.
 */
export async function updateCertificate(
  courseId: string,
  certificateData: Record<string, any>,
): Promise<Record<string, any>> {
  const { data } = await getAuthenticatedHttpClient()
    .post(
      getUpdateCertificateApiUrl(courseId, certificateData.id),
      prepareCertificatePayload(certificateData),
    );
  /* istanbul ignore next */
  return camelCaseObject(data);
}

/**
 * Delete course certificate.
 */
export async function deleteCertificate(courseId: string, certificateId: number): Promise<Record<string, any>> {
  const { data } = await getAuthenticatedHttpClient()
    .delete(
      getUpdateCertificateApiUrl(courseId, certificateId),
    );
  return data;
}

/**
 * Activate/deactivate course certificate.
 */
export async function updateActiveStatus(path: string, activationStatus: unknown): Promise<Record<string, any>> {
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

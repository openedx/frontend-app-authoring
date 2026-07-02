import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { prepareCertificatePayload } from '../utils';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getCertificatesApiUrl = (courseId: string) =>
  `${getApiBaseUrl()}/api/contentstore/v1/certificates/${courseId}`;
export const getCertificateApiUrl = (courseId: string) => `${getApiBaseUrl()}/certificates/${courseId}`;
export const getUpdateCertificateApiUrl = (courseId: string, certificateId: number) =>
  `${getCertificateApiUrl(courseId)}/${certificateId}`;
export const getUpdateCertificateActiveStatusApiUrl = (path: string) => `${getApiBaseUrl()}${path}`;

export interface Signature {
  id?: number;
  name: string;
  organization: string;
  signatureImagePath: string;
  title: string;
}

export interface Certificate {
  id: number;
  courseTitle: string;
  description: string;
  editing?: boolean;
  isActive: boolean;
  name: string;
  signatories: Signature[];
  version: number;
}

export interface CertificatesMetadata {
  certificateActivationHandlerUrl: string;
  certificateWebViewUrl: string;
  certificates: Certificate[];
  courseModes: string[];
  courseNumber: string;
  courseNumberOverride: string;
  courseTitle: string;
  hasCertificateModes: boolean;
  isActive: boolean;
  isGlobalStaff: boolean;
}

export interface CreateCertificateData {
  courseTitle: string;
  signatories: Signature[];
}

/**
 * Gets certificates for a course.
 */
export async function getCertificates(courseId: string): Promise<CertificatesMetadata> {
  const { data } = await getAuthenticatedHttpClient()
    .get(getCertificatesApiUrl(courseId));

  return camelCaseObject(data);
}

/**
 * Create course certificate.
 */
export async function createCertificate(
  courseId: string,
  certificatesData: CreateCertificateData,
): Promise<Certificate> {
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
  certificateData: Certificate,
): Promise<Certificate> {
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
export async function deleteCertificate(courseId: string, certificateId: number): Promise<void> {
  return await getAuthenticatedHttpClient()
    .delete(
      getUpdateCertificateApiUrl(courseId, certificateId),
    );
}

/**
 * Activate/deactivate course certificate.
 */
export async function updateActiveStatus(path: string, activationStatus: unknown): Promise<void> {
  const body = {
    is_active: activationStatus,
  };

  return await getAuthenticatedHttpClient()
    .post(
      getUpdateCertificateActiveStatusApiUrl(path),
      body,
    );
}

import { convertObjectToSnakeCase } from '../utils';

export const prepareCertificatePayload = (data) => convertObjectToSnakeCase(({
  ...data,
  courseTitle: data.courseTitle,
  description: 'Description of the certificate',
  editing: data.editing || true,
  isActive: data.isActive || false,
  name: 'Name of the certificate',
  version: data.version || 1,
  signatories: data.signatories
    .map(signatory => convertObjectToSnakeCase(signatory, true))
    .map(signatorySnakeCase => ({ ...signatorySnakeCase, certificate: signatorySnakeCase.certificate || null })),
}), true);

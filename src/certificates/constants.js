import { v4 as uuid } from 'uuid';

// eslint-disable-next-line import/prefer-default-export
export const defaultCertificate = {
  courseTitle: '',
  signatories: [{
    id: `local-${uuid()}`,
    name: '',
    title: '',
    organization: '',
    signatureImagePath: '',
  }],
};

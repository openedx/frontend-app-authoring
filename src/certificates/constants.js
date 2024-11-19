import { v4 as uuid } from 'uuid';

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

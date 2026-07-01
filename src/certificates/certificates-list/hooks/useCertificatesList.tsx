import { useState } from 'react';

import { MODE_STATES } from '../../data/constants';
import { defaultCertificate } from '../../constants';
import { useCertificates } from '@src/certificates/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCertificatesContext } from '@src/certificates/context';

const useCertificatesList = () => {
  const { courseId } = useCourseAuthoringContext();

  const {
    data: certificatesData,
  } = useCertificates(courseId);
  const {
    setComponentMode,
    updateCertificateMutation,
  } = useCertificatesContext();

  const {
    certificates = [],
    courseTitle,
    courseNumber,
    courseNumberOverride,
  } = certificatesData ?? {};

  const [editModes, setEditModes] = useState({});

  const initialValues = certificates.map((certificate) => ({
    ...certificate,
    courseTitle: certificate.courseTitle || defaultCertificate.courseTitle,
    signatories: certificate.signatories || defaultCertificate.signatories,
  }));

  const handleSubmit = async (values) => {
    await updateCertificateMutation.mutate(values);
    setEditModes({});
    setComponentMode(MODE_STATES.view);
  };

  return {
    editModes,
    courseTitle,
    certificates,
    courseNumber,
    initialValues,
    courseNumberOverride,
    setEditModes,
    handleSubmit,
  };
};

export default useCertificatesList;

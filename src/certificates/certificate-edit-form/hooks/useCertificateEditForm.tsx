import { useToggle } from '@openedx/paragon';

import { MODE_STATES } from '../../data/constants';
import { defaultCertificate } from '../../constants';
import { useCertificates } from '@src/certificates/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCertificatesContext } from '@src/certificates/context';

const useCertificateEditForm = () => {
  const { courseId } = useCourseAuthoringContext();
  const [isConfirmOpen, confirmOpen, confirmClose] = useToggle(false);

  const {
    data: certificatesData,
  } = useCertificates(courseId);
  const {
    setComponentMode,
    updateCertificateMutation,
    deleteCertificateMutation,
  } = useCertificatesContext();

  const {
    courseTitle,
    certificates = [],
  } = certificatesData ?? {};

  const handleCertificateSubmit = (values) => {
    const signatoriesWithoutLocalIds = values.signatories.map(signatory => {
      if (signatory.id && typeof signatory.id === 'string' && signatory.id.startsWith('local-')) {
        const { id, ...rest } = signatory;
        return rest;
      }
      return signatory;
    });

    const newValues = {
      ...values,
      signatories: signatoriesWithoutLocalIds,
    };

    updateCertificateMutation.mutateAsync(newValues);
  };

  const handleCertificateUpdateCancel = (resetForm) => {
    setComponentMode(MODE_STATES.view);
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCertificateDelete = (certificateId) => {
    deleteCertificateMutation.mutate(certificateId);
  };

  const initialValues = certificates.map((certificate) => ({
    ...certificate,
    courseTitle: certificate.courseTitle || defaultCertificate.courseTitle,
    signatories: certificate.signatories || defaultCertificate.signatories,
  }));

  return {
    confirmOpen,
    courseTitle,
    certificates,
    confirmClose,
    initialValues,
    isConfirmOpen,
    handleCertificateDelete,
    handleCertificateSubmit,
    handleCertificateUpdateCancel,
  };
};

export default useCertificateEditForm;

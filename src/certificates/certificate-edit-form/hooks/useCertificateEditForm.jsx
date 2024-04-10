import { useSelector, useDispatch } from 'react-redux';
import { useToggle } from '@openedx/paragon';

import { MODE_STATES } from '../../data/constants';
import { getCourseTitle, getCertificates } from '../../data/selectors';
import { setMode } from '../../data/slice';
import { updateCourseCertificate, deleteCourseCertificate } from '../../data/thunks';
import { defaultCertificate } from '../../constants';

const useCertificateEditForm = (courseId) => {
  const dispatch = useDispatch();
  const [isConfirmOpen, confirmOpen, confirmClose] = useToggle(false);
  const courseTitle = useSelector(getCourseTitle);
  const certificates = useSelector(getCertificates);

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

    dispatch(updateCourseCertificate(courseId, newValues));
  };

  const handleCertificateUpdateCancel = (resetForm) => {
    dispatch(setMode(MODE_STATES.view));
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCertificateDelete = (certificateId) => {
    dispatch(deleteCourseCertificate(courseId, certificateId));
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

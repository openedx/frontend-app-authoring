import { MODE_STATES } from '../../data/constants';
import { useCertificates } from '@src/certificates/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCertificatesContext } from '@src/certificates/context';

const useCertificateCreateForm = () => {
  const { courseId } = useCourseAuthoringContext();

  const {
    data: certificatesData,
  } = useCertificates(courseId);
  const {
    setComponentMode,
    createCertificateMutation,
  } = useCertificatesContext();

  const courseTitle = certificatesData?.courseTitle;

  const handleCertificateSubmit = (values) => {
    const signatoriesWithoutIds = values.signatories.map(({ id, ...rest }) => rest);
    const newValues = { ...values, signatories: signatoriesWithoutIds };
    createCertificateMutation.mutateAsync(newValues);
  };

  const handleFormCancel = (resetForm) => {
    setComponentMode(MODE_STATES.noCertificates);
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    courseTitle,
    handleCertificateSubmit,
    handleFormCancel,
  };
};

export default useCertificateCreateForm;

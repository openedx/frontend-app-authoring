import { useToggle } from '@openedx/paragon';

import { MODE_STATES } from '../../data/constants';
import { useCertificates } from '@src/certificates/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCertificatesContext } from '@src/certificates/context';

const useCertificateDetails = (certificateId) => {
  const { courseId } = useCourseAuthoringContext();
  const {
    data: certificatesData,
  } = useCertificates(courseId);
  const {
    setComponentMode,
    deleteCertificateMutation,
  } = useCertificatesContext();

  const [isConfirmOpen, confirmOpen, confirmClose] = useToggle(false);
  const [isEditModalOpen, editModalOpen, editModalClose] = useToggle(false);
  const isCertificateActive = certificatesData?.isActive;

  const handleEditAll = () => {
    setComponentMode(MODE_STATES.editAll);
  };

  const handleDeleteCard = () => {
    if (certificateId) {
      void deleteCertificateMutation.mutateAsync(certificateId);
    }
  };

  return {
    isConfirmOpen,
    confirmOpen,
    confirmClose,
    isEditModalOpen,
    editModalOpen,
    editModalClose,
    isCertificateActive,
    handleEditAll,
    handleDeleteCard,
  };
};

export default useCertificateDetails;

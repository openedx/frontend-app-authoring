import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useToggle } from '@openedx/paragon';

import { setMode } from '../../data/slice';
import { deleteCourseCertificate } from '../../data/thunks';
import { getIsCertificateActive } from '../../data/selectors';
import { MODE_STATES } from '../../data/constants';

const useCertificateDetails = (certificateId) => {
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const [isConfirmOpen, confirmOpen, confirmClose] = useToggle(false);
  const [isEditModalOpen, editModalOpen, editModalClose] = useToggle(false);
  const isCertificateActive = useSelector(getIsCertificateActive);

  const handleEditAll = () => {
    dispatch(setMode(MODE_STATES.editAll));
  };

  const handleDeleteCard = () => {
    if (certificateId) {
      dispatch(deleteCourseCertificate(courseId, certificateId));
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

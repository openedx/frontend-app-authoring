import { useDispatch, useSelector } from 'react-redux';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useEffect, useState } from 'react';
import { useToggle } from '@openedx/paragon';

import { USER_ROLES } from '../constants';
import { RequestStatus } from '../data/constants';
import { useModel } from '../generic/model-store';
import {
  changeRoleTeamUserQuery,
  createCourseTeamQuery,
  deleteCourseTeamQuery,
  fetchCourseTeamQuery,
} from './data/thunk';
import {
  getCourseTeamLoadingStatus,
  getCourseTeamUsers,
  getErrorMessage,
  getIsAllowActions,
  getIsOwnershipHint, getSavingStatus,
} from './data/selectors';
import { setErrorMessage } from './data/slice';
import { MODAL_TYPES } from './constants';

const useCourseTeam = ({ courseId }) => {
  const dispatch = useDispatch();

  const { email: currentUserEmail } = getAuthenticatedUser();
  const courseDetails = useModel('courseDetails', courseId);

  const [modalType, setModalType] = useState(MODAL_TYPES.delete);
  const [isInfoModalOpen, openInfoModal, closeInfoModal] = useToggle(false);
  const [isFormVisible, openForm, hideForm] = useToggle(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [isQueryPending, setIsQueryPending] = useState(false);
  const courseTeamUsers = useSelector(getCourseTeamUsers);
  const errorMessage = useSelector(getErrorMessage);
  const savingStatus = useSelector(getSavingStatus);
  const isAllowActions = useSelector(getIsAllowActions);
  const isOwnershipHint = useSelector(getIsOwnershipHint);
  const loadingCourseTeamStatus = useSelector(getCourseTeamLoadingStatus);

  const isSingleAdmin = courseTeamUsers.filter((user) => user.role === USER_ROLES.admin).length === 1;

  const handleOpenInfoModal = (type, email) => {
    setCurrentEmail(email);
    setModalType(type);
    openInfoModal();
  };

  const handleCloseInfoModal = () => {
    dispatch(setErrorMessage(''));
    closeInfoModal();
  };

  const handleAddUserSubmit = (data) => {
    setIsQueryPending(true);

    const { email } = data;
    const isUserContains = courseTeamUsers.some((user) => user.email === email);

    if (isUserContains) {
      handleOpenInfoModal(MODAL_TYPES.warning, email);
      return;
    }

    dispatch(createCourseTeamQuery(courseId, email)).then((result) => {
      if (result) {
        hideForm();
        dispatch(setErrorMessage(''));
        return;
      }

      handleOpenInfoModal(MODAL_TYPES.error, email);
    });
  };

  const handleDeleteUserSubmit = () => {
    setIsQueryPending(true);
    dispatch(deleteCourseTeamQuery(courseId, currentEmail));
    handleCloseInfoModal();
  };

  const handleChangeRoleUserSubmit = (email, role) => {
    setIsQueryPending(true);
    dispatch(changeRoleTeamUserQuery(courseId, email, role));
  };

  const handleInternetConnectionFailed = () => {
    setIsQueryPending(false);
  };

  const handleOpenDeleteModal = (email) => {
    handleOpenInfoModal(MODAL_TYPES.delete, email);
  };

  useEffect(() => {
    dispatch(fetchCourseTeamQuery(courseId));
  }, [courseId]);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      setIsQueryPending(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [savingStatus]);

  return {
    modalType,
    errorMessage,
    courseName: courseDetails?.name || '',
    currentEmail,
    courseTeamUsers,
    currentUserEmail,
    isLoading: loadingCourseTeamStatus === RequestStatus.IN_PROGRESS,
    isLoadingDenied: loadingCourseTeamStatus === RequestStatus.DENIED,
    isSingleAdmin,
    isFormVisible,
    isAllowActions,
    isInfoModalOpen,
    isOwnershipHint,
    isQueryPending,
    isInternetConnectionAlertFailed: savingStatus === RequestStatus.FAILED,
    isShowAddTeamMember: courseTeamUsers.length === 1 && isAllowActions,
    isShowInitialSidebar: !courseTeamUsers.length && !isFormVisible,
    isShowUserFilledSidebar: Boolean(courseTeamUsers.length) || isFormVisible,
    openForm,
    hideForm,
    closeInfoModal,
    handleAddUserSubmit,
    handleOpenInfoModal,
    handleOpenDeleteModal,
    handleDeleteUserSubmit,
    handleChangeRoleUserSubmit,
    handleInternetConnectionFailed,
  };
};

export { useCourseTeam };

import { useDispatch, useSelector } from 'react-redux';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useEffect, useState } from 'react';
import { useToggle } from '@edx/paragon';

import { useModel } from '../generic/model-store';
import { USER_ROLES } from '../constants';
import {
  changeRoleTeamUserQuery,
  createCourseTeamQuery,
  deleteCourseTeamQuery,
  fetchCourseTeamQuery,
} from './data/thunk';
import {
  getCourseTeamUsers,
  getErrorEmail,
  getIsAllowActions,
  getIsOwnershipHint,
} from './data/selectors';
import { setErrorEmail } from './data/slice';
import { MODAL_TYPES } from './constants';

const useCourseTeam = ({ courseId }) => {
  const dispatch = useDispatch();

  const { email: currentUserEmail } = getAuthenticatedUser();
  const courseDetails = useModel('courseDetails', courseId);

  const [modalType, setModalType] = useState(MODAL_TYPES.delete);
  const [isInfoModalOpen, openInfoModal, closeInfoModal] = useToggle(false);
  const [isFormVisible, openForm, hideForm] = useToggle(false);
  const [currentEmail, setCurrentEmail] = useState('');

  const courseTeamUsers = useSelector(getCourseTeamUsers);
  const errorEmail = useSelector(getErrorEmail);
  const isAllowActions = useSelector(getIsAllowActions);
  const isOwnershipHint = useSelector(getIsOwnershipHint);
  const isSingleAdmin = courseTeamUsers.filter((user) => user.role === USER_ROLES.admin).length === 1;

  const handleOpenInfoModal = (type, email) => {
    setCurrentEmail(email);
    setModalType(type);
    openInfoModal();
  };

  const handleCloseInfoModal = () => {
    dispatch(setErrorEmail(''));
    closeInfoModal();
  };

  const handleAddUserSubmit = (data) => {
    const { email } = data;
    const isUserContains = courseTeamUsers.some((user) => user.email === email);

    setCurrentEmail(email);

    if (isUserContains) {
      handleOpenInfoModal(MODAL_TYPES.warning, email);
      return;
    }

    dispatch(createCourseTeamQuery(courseId, email)).then((result) => {
      if (result) {
        hideForm();
        dispatch(setErrorEmail(''));
        return;
      }

      handleOpenInfoModal(MODAL_TYPES.error, email);
    });
  };

  const handleDeleteUserSubmit = () => {
    dispatch(deleteCourseTeamQuery(courseId, currentEmail));
    handleCloseInfoModal();
  };

  const handleChangeRoleUserSubmit = (email, role) => {
    dispatch(changeRoleTeamUserQuery(courseId, email, role));
  };

  useEffect(() => {
    dispatch(fetchCourseTeamQuery(courseId));
  }, [courseId]);

  return {
    modalType,
    errorEmail,
    courseName: courseDetails?.name || '',
    currentEmail,
    courseTeamUsers,
    currentUserEmail,
    isSingleAdmin,
    isFormVisible,
    isAllowActions,
    isInfoModalOpen,
    isOwnershipHint,
    isShowAddTeamMember: courseTeamUsers.length === 1 && isAllowActions,
    isShowInitialSidebar: !courseTeamUsers.length && !isFormVisible,
    isShowUserFilledSidebar: Boolean(courseTeamUsers.length) || isFormVisible,
    openForm,
    hideForm,
    closeInfoModal,
    handleAddUserSubmit,
    handleOpenInfoModal,
    handleChangeRoleUserSubmit,
    handleDeleteUserSubmit,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useCourseTeam };

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useState } from 'react';
import { useToggle } from '@openedx/paragon';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { USER_ROLES } from '../constants';
import { MODAL_TYPES, type ModalType } from './constants';
import {
  useChangeRoleTeamUser,
  useCourseTeamData,
  useCreateTeamUser,
  useDeleteTeamUser,
} from './data/apiHooks';

const useCourseTeam = () => {
  const { courseId } = useCourseAuthoringContext();

  const { email: currentUserEmail } = getAuthenticatedUser();
  const { courseDetails } = useCourseAuthoringContext();
  const {
    data,
    isPending: isLoadingCourseTeamStatus,
    failureReason: courseTeamQueryError,
  } = useCourseTeamData(courseId);

  const {
    users: courseTeamUsers = [],
    allowActions: isAllowActions = false,
    showTransferOwnershipHint: isOwnershipHint = false,
  } = data ?? {};

  const addUserMutation = useCreateTeamUser(courseId);
  const editUserRoleMutation = useChangeRoleTeamUser(courseId);
  const deleteUserMutation = useDeleteTeamUser(courseId);

  const [modalType, setModalType] = useState<ModalType>(MODAL_TYPES.delete);
  const [isInfoModalOpen, openInfoModal, closeInfoModal] = useToggle(false);
  const [isFormVisible, openForm, hideForm] = useToggle(false);
  const [currentEmail, setCurrentEmail] = useState('');

  const courseTeamStatusIsDenied = courseTeamQueryError?.response?.status === 403;

  const isSingleAdmin = courseTeamUsers.filter((user) => user.role === USER_ROLES.admin).length === 1;

  const handleOpenInfoModal = (type: ModalType, email: string) => {
    setCurrentEmail(email);
    setModalType(type);
    openInfoModal();
  };

  const handleAddUserSubmit = (body: { email: string }) => {
    const { email } = body;
    const isUserContains = courseTeamUsers.some((user) => user.email === email);

    if (isUserContains) {
      handleOpenInfoModal(MODAL_TYPES.warning, email);
      return;
    }

    addUserMutation.mutateAsync(email).then(() => {
      hideForm();
    }).catch(() => {
      handleOpenInfoModal(MODAL_TYPES.error, email);
    });
  };

  const handleDeleteUserSubmit = () => {
    deleteUserMutation.mutate(currentEmail);
    closeInfoModal();
  };

  const handleChangeRoleUserSubmit = (email: string, role: string) => {
    editUserRoleMutation.mutate({ email, role });
  };

  const handleOpenDeleteModal = (email: string) => {
    handleOpenInfoModal(MODAL_TYPES.delete, email);
  };

  const getErrorMessage = () => {
    const errorObject = addUserMutation.error ?? editUserRoleMutation.error ?? deleteUserMutation.error;
    // @ts-ignore
    return errorObject?.response?.data?.error;
  };

  return {
    modalType,
    courseName: courseDetails?.name ?? '',
    currentEmail,
    courseTeamUsers,
    currentUserEmail,
    errorMessage: getErrorMessage(),
    isLoading: isLoadingCourseTeamStatus,
    isLoadingDenied: courseTeamStatusIsDenied,
    isSingleAdmin,
    isFormVisible,
    isAllowActions,
    isInfoModalOpen,
    isOwnershipHint,
    isQueryPending: addUserMutation.isPending || deleteUserMutation.isPending || editUserRoleMutation.isPending,
    isShowAddTeamMember: courseTeamUsers.length === 1 && isAllowActions,
    isShowInitialSidebar: !courseTeamUsers.length && !isFormVisible,
    isShowUserFilledSidebar: Boolean(courseTeamUsers?.length) || isFormVisible,
    openForm,
    hideForm,
    closeInfoModal,
    handleAddUserSubmit,
    handleOpenInfoModal,
    handleOpenDeleteModal,
    handleDeleteUserSubmit,
    handleChangeRoleUserSubmit,
  };
};

export { useCourseTeam };

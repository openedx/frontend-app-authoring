import moment from 'moment/moment';
import { useState } from 'react';
import { useToggle } from '@openedx/paragon';

import { COMMA_SEPARATED_DATE_FORMAT } from '../constants';
import { convertToDateFromString } from '../utils';
import { REQUEST_TYPES } from './constants';
import {
  useCourseHandoutsQuery,
  useCourseUpdatesQuery,
  useCreateCourseUpdate,
  useDeleteCourseUpdate,
  useEditCourseHandouts,
  useEditCourseUpdate,
} from './data/apiHooks';
import type { CourseHandouts, CourseUpdate } from './data/api';

type RequestType = (typeof REQUEST_TYPES)[keyof typeof REQUEST_TYPES];
type UpdateFormData = Omit<CourseUpdate, 'date'> & CourseHandouts & { date: string | Date; };
type CurrentUpdate = Omit<CourseUpdate, 'date'> & { date: string | Date; };

const useCourseUpdates = ({ courseId }: { courseId: string; }) => {
  const initialUpdate: CurrentUpdate = { id: 0, date: moment().utc().toDate(), content: '' };
  const [requestType, setRequestType] = useState<RequestType>('' as RequestType);
  const [isUpdateFormOpen, openUpdateForm, closeUpdateForm] = useToggle(false);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const [currentUpdate, setCurrentUpdate] = useState<CurrentUpdate>(initialUpdate);

  const updatesQuery = useCourseUpdatesQuery(courseId);
  const handoutsQuery = useCourseHandoutsQuery(courseId);
  const createMutation = useCreateCourseUpdate(courseId);
  const editMutation = useEditCourseUpdate(courseId);
  const deleteMutation = useDeleteCourseUpdate(courseId);
  const handoutsMutation = useEditCourseHandouts(courseId);

  const courseUpdates = updatesQuery.data ?? [];
  const courseHandouts = handoutsQuery.data ?? {};
  const courseUpdatesInitialValues = requestType === REQUEST_TYPES.edit_handouts
    ? courseHandouts
    : currentUpdate;

  const handleOpenUpdateForm = (type: RequestType, courseUpdate?: CourseUpdate) => {
    setRequestType(type);
    if (type === REQUEST_TYPES.add_new_update) { setCurrentUpdate(initialUpdate); }
    if (type === REQUEST_TYPES.edit_update && courseUpdate) { setCurrentUpdate(courseUpdate); }
    if (type === REQUEST_TYPES.edit_handouts) { window.scrollTo(0, 0); }
    openUpdateForm();
  };

  const handleOpenDeleteForm = (courseUpdate: CourseUpdate) => {
    setRequestType(REQUEST_TYPES.delete_update);
    setCurrentUpdate(courseUpdate);
    openDeleteModal();
  };

  const handleUpdatesSubmit = (data: UpdateFormData) => {
    resetMutationErrors();
    const dateWithoutTimezone = data.date instanceof Date ? data.date : convertToDateFromString(data.date);
    const dataToSend = {
      ...data,
      date: moment(dateWithoutTimezone).format(COMMA_SEPARATED_DATE_FORMAT),
    };
    const { id, date, content } = dataToSend;
    closeUpdateForm();
    setCurrentUpdate(initialUpdate);

    switch (requestType) {
      case REQUEST_TYPES.add_new_update:
        return createMutation.mutateAsync({ date, content });
      case REQUEST_TYPES.edit_update:
        return editMutation.mutateAsync({ id, date, content });
      case REQUEST_TYPES.edit_handouts:
        return handoutsMutation.mutateAsync({ ...data, data: data.data || '' });
      default:
        return Promise.resolve(true);
    }
  };

  const handleDeleteUpdateSubmit = () => {
    resetMutationErrors();
    deleteMutation.mutate(currentUpdate.id);
    setCurrentUpdate(initialUpdate);
    closeDeleteModal();
  };

  const resetMutationErrors = () => {
    createMutation.reset();
    editMutation.reset();
    deleteMutation.reset();
    handoutsMutation.reset();
  };

  const mutationErrors = {
    creatingUpdate: createMutation.isError,
    savingUpdates: editMutation.isError,
    deletingUpdates: deleteMutation.isError,
    savingHandouts: handoutsMutation.isError,
  };
  const anyStatusFailed = updatesQuery.isError || handoutsQuery.isError || Object.values(mutationErrors).some(Boolean);
  // Keep 403 separate from generic failures because the UI renders a dedicated denied state.
  const anyStatusDenied = [updatesQuery.error, handoutsQuery.error].some(error => error?.response?.status === 403);
  const anyStatusInProgress = updatesQuery.isFetching || handoutsQuery.isFetching;
  const anyStatusPending = [createMutation, editMutation, deleteMutation, handoutsMutation]
    .some(mutation => mutation.isPending);

  return {
    requestType,
    courseUpdates,
    courseHandouts,
    courseUpdatesInitialValues,
    isMainFormOpen: isUpdateFormOpen && requestType !== REQUEST_TYPES.edit_update,
    isInnerFormOpen: (id: number) =>
      isUpdateFormOpen && currentUpdate.id === id && requestType === REQUEST_TYPES.edit_update,
    isUpdateFormOpen,
    isDeleteModalOpen,
    closeUpdateForm,
    closeDeleteModal,
    handleUpdatesSubmit,
    handleOpenUpdateForm,
    handleDeleteUpdateSubmit,
    handleOpenDeleteForm,
    errors: {
      loadingUpdates: updatesQuery.isError,
      loadingHandouts: handoutsQuery.isError,
      ...mutationErrors,
    },
    anyStatusFailed: anyStatusFailed && !anyStatusDenied,
    anyStatusDenied,
    anyStatusInProgress,
    anyStatusPending,
  };
};

export { useCourseUpdates };

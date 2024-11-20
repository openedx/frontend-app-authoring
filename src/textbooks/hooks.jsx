import { useDispatch, useSelector } from 'react-redux';
import { useContext, useEffect } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';

import { updateSavingStatus } from './data/slice';
import { RequestStatus } from '../data/constants';
import {
  getTextbooksData,
  getLoadingStatus,
  getSavingStatus,
  getErrorMessage,
} from './data/selectors';
import {
  createTextbookQuery,
  fetchTextbooksQuery,
  editTextbookQuery,
  deleteTextbookQuery,
} from './data/thunk';
import messages from './messages';

const useTextbooks = (courseId, waffleFlags) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { config } = useContext(AppContext);

  const textbooks = useSelector(getTextbooksData);
  const loadingStatus = useSelector(getLoadingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const errorMessage = useSelector(getErrorMessage);

  const [isTextbookFormOpen, openTextbookForm, closeTextbookForm] = useToggle(false);

  const breadcrumbs = [
    {
      label: intl.formatMessage(messages.breadcrumbContent),
      to: waffleFlags.useNewCourseOutlinePage ? `/course/${courseId}` : `${config.STUDIO_BASE_URL}/course/${courseId}`,
    },
    {
      label: intl.formatMessage(messages.breadcrumbPagesAndResources),
      to: `/course/${courseId}/pages-and-resources`,
    },
    {
      label: '',
      to: `/course/${courseId}/textbooks`,
    },
  ];

  const handleTextbookFormSubmit = (formValues) => {
    dispatch(createTextbookQuery(courseId, formValues));
  };

  const handleTextbookEditFormSubmit = (formValues) => {
    dispatch(editTextbookQuery(courseId, formValues));
  };

  const handleTextbookDeleteSubmit = (textbookId) => {
    dispatch(deleteTextbookQuery(courseId, textbookId));
  };

  const handleSavingStatusDispatch = (status) => {
    if (status.status !== RequestStatus.SUCCESSFUL) {
      dispatch(updateSavingStatus(status));
    }
  };

  useEffect(() => {
    dispatch(fetchTextbooksQuery(courseId));
  }, [courseId]);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeTextbookForm();
    }
  }, [savingStatus]);

  return {
    isLoading: loadingStatus === RequestStatus.IN_PROGRESS,
    isLoadingFailed: loadingStatus === RequestStatus.FAILED,
    savingStatus,
    errorMessage,
    textbooks,
    breadcrumbs,
    isTextbookFormOpen,
    openTextbookForm,
    closeTextbookForm,
    handleTextbookFormSubmit,
    handleSavingStatusDispatch,
    handleTextbookEditFormSubmit,
    handleTextbookDeleteSubmit,
  };
};

export { useTextbooks };

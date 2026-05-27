/* eslint-disable import/no-extraneous-dependencies */
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToggle } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useWaffleFlags } from '@src/data/apiHooks';
import { getMessageFromAxiosError } from '@src/generic/saving-error-alert/utils';
import messages from './messages';
import {
  useCreateTextbook,
  useDeleteTextbook,
  useEditTextbook,
  useTextbooks,
} from './data/apiHooks';
import { BaseTextbook, Textbook } from './data/api';

export type OnErrorCallbackFunc = (error: AxiosError) => void;

export const useTextbooksFeatures = () => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();
  const waffleFlags = useWaffleFlags(courseId);

  const {
    data: textbooksData,
    isPending: isPendingGetTextbooks,
    isError: isErrorGetTextbooks,
  } = useTextbooks(courseId);

  const [mutationErrorMessage, setMutationErrorMessage] = useState<string>();

  const handleMutationError: OnErrorCallbackFunc = (error) => (
    /* istanbul ignore next */
    setMutationErrorMessage(getMessageFromAxiosError(error))
  );

  const createMutation = useCreateTextbook(courseId);
  const updateMutation = useEditTextbook(courseId);
  const deleteMutation = useDeleteTextbook(courseId);

  const textbooks = textbooksData?.textbooks ?? [];
  const anyMutationFailed = createMutation.isError || updateMutation.isError || deleteMutation.isError;

  const [isTextbookFormOpen, openTextbookForm, closeTextbookForm] = useToggle(false);

  const breadcrumbs = [
    {
      label: intl.formatMessage(messages.breadcrumbContent),
      to: waffleFlags.useNewCourseOutlinePage
        ? `/course/${courseId}`
        : `${getConfig().STUDIO_BASE_URL}/course/${courseId}`,
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

  const handleTextbookFormSubmit = (formValues: BaseTextbook) => {
    /* istanbul ignore next */
    createMutation.mutate(formValues, {
      onSuccess: closeTextbookForm,
      onError: handleMutationError,
    });
  };

  const handleTextbookEditFormSubmit = (formValues: Textbook, onSuccess: () => void) => {
    /* istanbul ignore next */
    updateMutation.mutate(formValues, {
      onSuccess,
      onError: handleMutationError,
    });
  };

  const handleTextbookDeleteSubmit = (textbookId: string) => {
    /* istanbul ignore next */
    deleteMutation.mutate(textbookId, {
      onError: handleMutationError,
    });
  };

  return {
    isLoading: isPendingGetTextbooks,
    isLoadingFailed: isErrorGetTextbooks,
    anyMutationFailed,
    textbooks,
    breadcrumbs,
    isTextbookFormOpen,
    mutationErrorMessage,
    openTextbookForm,
    closeTextbookForm,
    handleTextbookFormSubmit,
    handleTextbookEditFormSubmit,
    handleTextbookDeleteSubmit,
  };
};

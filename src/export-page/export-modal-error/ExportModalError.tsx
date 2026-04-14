import { useEffect, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Error as ErrorIcon } from '@openedx/paragon/icons';

import ModalNotification from '@src/generic/modal-notification';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import messages from './messages';
import { useCourseExportContext } from '../CourseExportContext';

const ExportModalError = () => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();
  const {
    fetchExportErrorMessage,
    errorUnitUrl,
  } = useCourseExportContext();

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  useEffect(() => {
    if (fetchExportErrorMessage) {
      setIsErrorModalOpen(true);
    }
  }, [fetchExportErrorMessage]);

  const handleUnitRedirect = () => {
    window.location.assign(errorUnitUrl ?? '');
  };
  const handleRedirectCourseHome = () => {
    window.location.assign(`${getConfig().STUDIO_BASE_URL}/course/${courseId}`);
  };
  return (
    <ModalNotification
      isOpen={isErrorModalOpen}
      title={intl.formatMessage(messages.errorTitle)}
      message={intl.formatMessage(
        errorUnitUrl
          ? messages.errorDescriptionUnit
          : messages.errorDescriptionNotUnit,
        { errorMessage: fetchExportErrorMessage },
      )}
      cancelButtonText={intl.formatMessage(
        errorUnitUrl ? messages.errorCancelButtonUnit : messages.errorCancelButtonNotUnit,
      )}
      actionButtonText={intl.formatMessage(
        errorUnitUrl ? messages.errorActionButtonUnit : messages.errorActionButtonNotUnit,
      )}
      handleCancel={() => setIsErrorModalOpen(false)}
      handleAction={errorUnitUrl ? handleUnitRedirect : handleRedirectCourseHome}
      variant="danger"
      icon={ErrorIcon}
    />
  );
};

export default ExportModalError;

import React, { useEffect } from 'react';
import {
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@edx/paragon';
import { history } from '@edx/frontend-platform';

import { getFormattedSuccessDate } from '../../export-page/utils';
import { RequestStatus } from '../../data/constants';
import CourseStepper from '../../generic/course-stepper';
import { IMPORT_STAGES } from '../data/constants';
import { fetchImportStatus } from '../data/thunks';
import {
  getCurrentStage, getError, getFileName, getLoadingStatus, getProgress, getSavingStatus, getSuccessDate,
} from '../data/selectors';
import messages from './messages';

const ImportStepper = ({ intl, courseId }) => {
  const currentStage = useSelector(getCurrentStage);
  const fileName = useSelector(getFileName);
  const { hasError, message: errorMessage } = useSelector(getError);
  const progress = useSelector(getProgress);
  const dispatch = useDispatch();
  const loadingStatus = useSelector(getLoadingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const successDate = useSelector(getSuccessDate);
  const isStopFetching = currentStage === IMPORT_STAGES.SUCCESS
    || loadingStatus === RequestStatus.FAILED
    || savingStatus === RequestStatus.FAILED
    || hasError;
  const formattedErrorMessage = hasError ? errorMessage || intl.formatMessage(messages.defaultErrorMessage) : '';

  useEffect(() => {
    const id = setInterval(() => {
      if (isStopFetching) {
        clearInterval(id);
      } else if (fileName) {
        dispatch(fetchImportStatus(courseId, fileName));
      }
    }, 3000);
    return () => clearInterval(id);
  });

  let successTitle = intl.formatMessage(messages.stepperSuccessTitle);
  const formattedSuccessDate = getFormattedSuccessDate(successDate);
  if (currentStage === IMPORT_STAGES.SUCCESS && formattedSuccessDate) {
    successTitle += formattedSuccessDate;
  }

  const handleRedirectCourseOutline = () => history.push(`/course/${courseId}/outline`);

  const steps = [
    {
      title: intl.formatMessage(messages.stepperUploadingTitle),
      description: intl.formatMessage(messages.stepperUploadingDescription),
      key: IMPORT_STAGES.UPLOADING,
    }, {
      title: intl.formatMessage(messages.stepperUnpackingTitle),
      description: intl.formatMessage(messages.stepperUnpackingDescription),
      key: IMPORT_STAGES.UNPACKING,
    }, {
      title: intl.formatMessage(messages.stepperVerifyingTitle),
      description: intl.formatMessage(messages.stepperVerifyingDescription),
      key: IMPORT_STAGES.VERIFYING,
    }, {
      title: intl.formatMessage(messages.stepperUpdatingTitle),
      description: intl.formatMessage(messages.stepperUpdatingDescription),
      key: IMPORT_STAGES.UPDATING,
    }, {
      title: successTitle,
      description: intl.formatMessage(messages.stepperSuccessDescription),
      key: IMPORT_STAGES.SUCCESS,
    },
  ];

  return (
    <section>
      <h3 className="mt-4">{intl.formatMessage(messages.stepperHeaderTitle)}</h3>
      <hr />
      <CourseStepper
        courseId={courseId}
        percent={progress}
        steps={steps}
        activeKey={currentStage}
        hasError={hasError}
        errorMessage={formattedErrorMessage}
      />
      {currentStage === IMPORT_STAGES.SUCCESS && (
        <Button onClick={handleRedirectCourseOutline}>{intl.formatMessage(messages.viewOutlineButton)}</Button>
      )}
    </section>
  );
};

ImportStepper.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(ImportStepper);

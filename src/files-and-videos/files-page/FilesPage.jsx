import { useIntl } from '@edx/frontend-platform/i18n';

import { Container } from '@openedx/paragon';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import CourseFilesSlot from '@src/plugin-slots/CourseFilesSlot';
import Placeholder from '@src/editors/Placeholder';
import { RequestStatus } from '@src/data/constants';
import getPageHeadTitle from '@src/generic/utils';
import EditFileAlertsSlot from '@src/plugin-slots/EditFileAlertsSlot';
import { AlertAgreementGatedFeature } from '@src/generic/agreement-gated-feature';
import { AgreementGated } from '@src/constants';

import { EditFileErrors } from '../generic';
import { fetchAssets, resetErrors } from './data/thunks';
import FilesPageProvider from './FilesPageProvider';
import messages from './messages';
import './FilesPage.scss';

const FilesPage = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { courseId, courseDetails } = useCourseAuthoringContext();
  document.title = getPageHeadTitle(courseDetails?.name || '', intl.formatMessage(messages.heading));
  const {
    loadingStatus,
    addingStatus: addAssetStatus,
    deletingStatus: deleteAssetStatus,
    updatingStatus: updateAssetStatus,
    errors: errorMessages,
  } = useSelector(state => state.assets);

  useEffect(() => {
    dispatch(fetchAssets(courseId));
  }, [courseId]);

  const handleErrorReset = (error) => dispatch(resetErrors(error));

  if (loadingStatus === RequestStatus.DENIED) {
    return (
      <div data-testid="under-construction-placeholder" className="row justify-contnt-center m-6">
        <Placeholder />
      </div>
    );
  }

  return (
    <FilesPageProvider courseId={courseId}>
      <Container size="xl" className="p-4 pt-4.5">
        <EditFileErrors
          resetErrors={handleErrorReset}
          errorMessages={errorMessages}
          addFileStatus={addAssetStatus}
          deleteFileStatus={deleteAssetStatus}
          updateFileStatus={updateAssetStatus}
          loadingStatus={loadingStatus}
        />
        <AlertAgreementGatedFeature
          gatingTypes={[AgreementGated.UPLOAD, AgreementGated.UPLOAD_FILES]}
        />
        <EditFileAlertsSlot />
        <div className="h2">
          {intl.formatMessage(messages.heading)}
        </div>
        {loadingStatus !== RequestStatus.FAILED && (
          <CourseFilesSlot />
        )}
      </Container>
    </FilesPageProvider>
  );
};

export default FilesPage;

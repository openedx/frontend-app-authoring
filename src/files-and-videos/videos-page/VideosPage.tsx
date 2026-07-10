import { AgreementGated } from '@src/constants';
import { AlertAgreementGatedFeature } from '@src/generic/agreement-gated-feature';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Container } from '@openedx/paragon';
import CourseVideosSlot from '@src/plugin-slots/CourseVideosSlot';
import { RequestStatus } from '@src/data/constants';
import Placeholder from '@src/editors/Placeholder';
import getPageHeadTitle from '@src/generic/utils';
import EditVideoAlertsSlot from '@src/plugin-slots/EditVideoAlertsSlot';

import { DeprecatedReduxState } from '@src/store';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { EditFileErrors } from '../generic';
import { fetchVideos, resetErrors } from './data/thunks';
import messages from './messages';
import VideosPageProvider from './VideosPageProvider';

const VideosPage = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { courseId, courseDetails } = useCourseAuthoringContext();
  const {
    loadingStatus,
    addingStatus: addVideoStatus,
    deletingStatus: deleteVideoStatus,
    updatingStatus: updateVideoStatus,
    errors: errorMessages,
  } = useSelector((state: DeprecatedReduxState) => state.videos);

  const handleErrorReset = (error) => dispatch(resetErrors(error));

  useEffect(() => {
    dispatch(fetchVideos(courseId));
  }, [courseId]);

  if (loadingStatus === RequestStatus.DENIED) {
    return (
      <div data-testid="under-construction-placeholder" className="row justify-contnt-center m-6">
        <Placeholder />
      </div>
    );
  }

  return (
    <VideosPageProvider courseId={courseId}>
      <Helmet>
        <title>{getPageHeadTitle(courseDetails?.name || '', intl.formatMessage(messages.heading))}</title>
      </Helmet>
      <Container size="xl" className="p-4 pt-4.5">
        <EditFileErrors
          resetErrors={handleErrorReset}
          errorMessages={errorMessages}
          addFileStatus={addVideoStatus}
          deleteFileStatus={deleteVideoStatus}
          updateFileStatus={updateVideoStatus}
          loadingStatus={loadingStatus}
        />
        <AlertAgreementGatedFeature
          gatingTypes={[AgreementGated.UPLOAD, AgreementGated.UPLOAD_VIDEOS]}
        />
        <EditVideoAlertsSlot />
        <h2>{intl.formatMessage(messages.heading)}</h2>
        <CourseVideosSlot />
      </Container>
    </VideosPageProvider>
  );
};

export default VideosPage;

import { useIntl } from '@edx/frontend-platform/i18n';
import { Container } from '@openedx/paragon';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import CourseVideosSlot from '../../plugin-slots/CourseVideosSlot';
import { RequestStatus } from '../../data/constants';

import Placeholder from '../../editors/Placeholder';
import { useModel } from '../../generic/model-store';
import getPageHeadTitle from '../../generic/utils';
import EditVideoAlertsSlot from '../../plugin-slots/EditVideoAlertsSlot';
import { EditFileErrors } from '../generic';
import { fetchVideos, resetErrors } from './data/thunks';
import messages from './messages';
import VideosPageProvider from './VideosPageProvider';

const VideosPage = ({
  courseId,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const courseDetails = useModel('courseDetails', courseId);
  const {
    loadingStatus,
    addingStatus: addVideoStatus,
    deletingStatus: deleteVideoStatus,
    updatingStatus: updateVideoStatus,
    errors: errorMessages,
  } = useSelector((state) => state.videos);

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
        <title>{getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.heading))}</title>
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
        <EditVideoAlertsSlot />
        <h2>{intl.formatMessage(messages.heading)}</h2>
        <CourseVideosSlot />
      </Container>
    </VideosPageProvider>
  );
};

VideosPage.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default VideosPage;

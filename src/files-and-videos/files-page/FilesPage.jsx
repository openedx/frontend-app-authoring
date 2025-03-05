import { useIntl } from '@edx/frontend-platform/i18n';
import { Container } from '@openedx/paragon';
import CourseFilesSlot from 'CourseAuthoring/plugin-slots/CourseFilesSlot';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RequestStatus } from '../../data/constants';
import Placeholder from '../../editors/Placeholder';
import { useModel } from '../../generic/model-store';
import getPageHeadTitle from '../../generic/utils';
import { EditFileErrors } from '../generic';
import { fetchAssets, resetErrors } from './data/thunks';
import FilesPageProvider from './FilesPageProvider';
import messages from './messages';

const FilesPage = ({
  courseId,
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.heading));
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
        <div className="h2">
          {intl.formatMessage(messages.heading)}
        </div>
        {loadingStatus !== RequestStatus.FAILED && (
          <CourseFilesSlot courseId={courseId} />
        )}
      </Container>
    </FilesPageProvider>
  );
};

FilesPage.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default FilesPage;

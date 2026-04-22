import { useIntl } from '@edx/frontend-platform/i18n';

import { Container } from '@openedx/paragon';
import { DeprecatedReduxState } from '@src/store';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import CourseFilesSlot from '@src/plugin-slots/CourseFilesSlot';
import Placeholder from '@src/editors/Placeholder';
import { RequestStatus } from '@src/data/constants';
import getPageHeadTitle from '@src/generic/utils';
import EditFileAlertsSlot from '@src/plugin-slots/EditFileAlertsSlot';

import { EditFileErrors } from '../generic';
import { fetchAssets, resetErrors } from './data/thunks';
import { FilesPageContext, type FilePickerOptions } from '../generic/FilesPageContext';
import messages from './messages';
import './FilesPage.scss';

const FilesPage = ({
  filePickerMode = false,
  filePickerOptions = undefined,
}: {
  filePickerMode?: boolean,
  filePickerOptions?: FilePickerOptions,
}) => {
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
  } = useSelector((state:DeprecatedReduxState) => state.assets);

  useEffect(() => {
    dispatch(fetchAssets(courseId));
  }, [courseId]);
  const contextValue = useMemo(() => ({
    filePickerMode,
    filePickerOptions,
  }), [filePickerMode, filePickerOptions]);

  const handleErrorReset = (error) => dispatch(resetErrors(error));

  if (loadingStatus === RequestStatus.DENIED) {
    return (
      <div data-testid="under-construction-placeholder" className="row justify-contnt-center m-6">
        <Placeholder />
      </div>
    );
  }

  return (
    <FilesPageContext.Provider value={contextValue}>
      <Container size="xl" className={filePickerOptions?.embedded ? '' : 'p-4 pt-4.5'}>
        <EditFileErrors
          resetErrors={handleErrorReset}
          errorMessages={errorMessages}
          addFileStatus={addAssetStatus}
          deleteFileStatus={deleteAssetStatus}
          updateFileStatus={updateAssetStatus}
          loadingStatus={loadingStatus}
        />
        <EditFileAlertsSlot />
        {!filePickerOptions?.embedded && (
          <div className="h2">
            {filePickerMode
              ? intl.formatMessage(messages.filePickerHeading, { multiSelect: filePickerOptions?.multiSelect })
              : intl.formatMessage(messages.heading)}
          </div>
        )}
        {loadingStatus !== RequestStatus.FAILED && (
          <CourseFilesSlot />
        )}
      </Container>
    </FilesPageContext.Provider>
  );
};

export default FilesPage;

/* eslint-disable no-console */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  injectIntl,
  FormattedMessage,
  intlShape,
} from '@edx/frontend-platform/i18n';
import {
  useToggle,
  ActionRow,
  Button,
  Sheet,
} from '@edx/paragon';
import Placeholder from '@edx/frontend-lib-content-components';

import { RequestStatus } from '../../data/constants';
import { useModels, useModel } from '../../generic/model-store';
import {
  fetchVideos,
} from './data/thunks';
import messages from './messages';
import VideosProvider from './VideosProvider';
import getPageHeadTitle from '../../generic/utils';
import FileTable from '../FileTable';
import EditFileErrors from '../EditFileErrors';

const Videos = ({
  courseId,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const [isTranscriptSettngsOpen, openTranscriptSettngs, closeTranscriptSettngs] = useToggle(false);
  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.heading));

  useEffect(() => {
    dispatch(fetchVideos(courseId));
  }, [courseId]);

  const {
    totalCount,
    videoIds,
    loadingStatus,
    addingStatus: addVideoStatus,
    deletingStatus: deleteVideoStatus,
    updatingStatus: updateVideoStatus,
    usageStatus: usagePathStatus,
    errors: errorMessages,
  } = useSelector(state => state.videos);

  // const handleAddFile = (file) => dispatch(addAssetFile(courseId, file, totalCount));
  // const handleDeleteFile = (id) => dispatch(deleteAssetFile(courseId, id, totalCount));
  // const handleDownloadFile = (selectedRows) => dispatch(fetchAssetDownload({ selectedRows, courseId }));
  // const handleLockFile = ({ fileId, locked }) => dispatch(updateAssetLock({ courseId, assetId: fileId, locked }));
  const handleAddFile = (file) => console.log(file);
  const handleDeleteFile = (id) => console.log(id);
  const handleDownloadFile = (selectedRows) => console.log(selectedRows);
  const handleLockFile = ({ fileId, locked }) => console.log({ fileId, locked });

  const videos = useModels('videos', videoIds);
  const data = {
    totalCount,
    fileIds: videoIds,
    loadingStatus,
    usagePathStatus,
    usageErrorMessages: errorMessages.usageMetrics,
  };
  const maxFileSize = 5 * 1073741824;
  const tableColumns = [
    // {
    //   Header: 'Name',
    //   accessor: 'displayName',
    // },
    // {
    //   Header: 'Type',
    //   accessor: 'wrapperType',
    //   Filter: CheckboxFilter,
    //   filter: 'includesValue',
    //   filterChoices: [
    //     {
    //       name: 'Code',
    //       value: 'code',
    //     },
    //     {
    //       name: 'Images',
    //       value: 'image',
    //     },
    //     {
    //       name: 'Documents',
    //       value: 'document',
    //     },
    //     {
    //       name: 'Audio',
    //       value: 'audio',
    //     },
    //   ],
    // },
  ];

  if (loadingStatus === RequestStatus.DENIED) {
    return (
      <div data-testid="under-construction-placeholder" className="row justify-contnt-center m-6">
        <Placeholder />
      </div>
    );
  }
  return (
    <VideosProvider courseId={courseId}>
      <main>
        <div className="p-4">
          <EditFileErrors
            errorMessages={errorMessages}
            addFileStatus={addVideoStatus}
            deleteFileStatus={deleteVideoStatus}
            updateFileStatus={updateVideoStatus}
          />
          <ActionRow>
            <div className="h2">
              <FormattedMessage {...messages.heading} />
            </div>
            <ActionRow.Spacer />
            <Button variant="link" size="sm" onClick={openTranscriptSettngs}>
              <FormattedMessage {...messages.transcriptSettingsButtonLabel} />
            </Button>
          </ActionRow>
        </div>
        <Sheet
          position="right"
          show={isTranscriptSettngsOpen}
          onClose={closeTranscriptSettngs}
        >
          temp!
        </Sheet>
        <FileTable
          {...{
            courseId,
            data,
            handleAddFile,
            handleDeleteFile,
            handleDownloadFile,
            handleLockFile,
            tableColumns,
            maxFileSize,
            files: videos,
          }}
        />
      </main>
    </VideosProvider>
  );
};

Videos.propTypes = {
  courseId: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(Videos);

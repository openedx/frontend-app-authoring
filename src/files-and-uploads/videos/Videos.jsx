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
} from '@edx/paragon';
import Placeholder from '@edx/frontend-lib-content-components';

import { RequestStatus } from '../../data/constants';
import { useModels, useModel } from '../../generic/model-store';
import {
  deleteVideoFile,
  fetchVideos,
} from './data/thunks';
import messages from './messages';
import VideosProvider from './VideosProvider';
import getPageHeadTitle from '../../generic/utils';
import FileTable from '../FileTable';
import EditFileErrors from '../EditFileErrors';
import ThumbnailColumn from '../table-components/table-custom-columns/ThumbnailColumn';
import ActiveColumn from '../table-components/table-custom-columns/ActiveColumn';
import StatusColumn from '../table-components/table-custom-columns/StatusColumn';
import TranscriptSettings from './transcript-settings';

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
    pageSettings,
  } = useSelector(state => state.videos);

  const {
    isVideoTranscriptEnabled,
    activeTranscriptPreferences,
    transcriptAvailableLanguages,
    transcriptCredentials,
    encodingsDownloadUrl,
  } = pageSettings;

  // const handleAddFile = (file) => dispatch(addAssetFile(courseId, file, totalCount));
  const handleDeleteFile = (id) => dispatch(deleteVideoFile(courseId, id, totalCount));
  // const handleDownloadFile = (selectedRows) => dispatch(fetchAssetDownload({ selectedRows, courseId }));
  const handleAddFile = (file) => console.log(file);
  const handleDownloadFile = (selectedRows) => console.log(selectedRows);
  // const handleTranscriptCredentials = ({data, global, provider}) => {
  // dispatch(addTranscriptCredentials({data, global, provider}))}

  const videos = useModels('videos', videoIds);
  const data = {
    encodingsDownloadUrl,
    totalCount,
    fileIds: videoIds,
    loadingStatus,
    usagePathStatus,
    usageErrorMessages: errorMessages.usageMetrics,
  };
  const maxFileSize = 5 * 1073741824;
  const transcriptColumn = {
    id: 'transcripts',
    Header: 'Transcript',
    Cell: ({ row }) => {
      const { transcripts } = row.original;
      const numOfTranscripts = transcripts.length;
      return numOfTranscripts > 0 ? `(${numOfTranscripts}) available` : null;
    },
  };
  const activeColumn = {
    id: 'usageLocations',
    Header: 'Active',
    Cell: ({ row }) => ActiveColumn({ row }),
  };
  const durationColumn = {
    id: 'duration',
    Header: 'Video length',
    Cell: ({ row }) => {
      const { duration } = row.original;
      return duration;
    },
  };
  const processingStatusColumn = {
    id: 'status',
    Header: '',
    Cell: ({ row }) => StatusColumn({ row }),
  };
  const videoThumbnailColumn = {
    id: 'courseVideoImageUrl',
    Header: '',
    Cell: ({ row }) => ThumbnailColumn({ row }),
  };
  const tableColumns = [
    { ...videoThumbnailColumn },
    {
      Header: 'File name',
      accessor: 'clientVideoId',
    },
    { ...durationColumn },
    { ...transcriptColumn },
    { ...activeColumn },
    { ...processingStatusColumn },
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
            {isVideoTranscriptEnabled ? (
              <Button variant="link" size="sm" onClick={openTranscriptSettngs}>
                <FormattedMessage {...messages.transcriptSettingsButtonLabel} />
              </Button>
            ) : null}
          </ActionRow>
        </div>
        {isVideoTranscriptEnabled ? (
          <TranscriptSettings
            {...{
              isTranscriptSettngsOpen,
              closeTranscriptSettngs,
              activeTranscriptPreferences,
              transcriptAvailableLanguages,
              transcriptCredentials,
            }}
          />
        ) : null}
        <FileTable
          {...{
            courseId,
            data,
            handleAddFile,
            handleDeleteFile,
            handleDownloadFile,
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

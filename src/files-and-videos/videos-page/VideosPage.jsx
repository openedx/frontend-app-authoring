import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
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
  CheckboxFilter,
} from '@edx/paragon';
import Placeholder from '@edx/frontend-lib-content-components';

import { RequestStatus } from '../../data/constants';
import { useModels, useModel } from '../../generic/model-store';
import {
  addVideoFile,
  addVideoThumbnail,
  deleteVideoFile,
  fetchVideoDownload,
  fetchVideos,
  getUsagePaths,
  resetErrors,
  updateVideoOrder,
} from './data/thunks';
import messages from './messages';
import VideosPageProvider from './VideosPageProvider';
import getPageHeadTitle from '../../generic/utils';
import {
  ActiveColumn,
  EditFileErrors,
  FileTable,
  StatusColumn,
  ThumbnailColumn,
} from '../generic';
import TranscriptSettings from './transcript-settings';
import VideoThumbnail from './VideoThumbnail';
import { getFormattedDuration, resampleFile } from './data/utils';
import FILES_AND_UPLOAD_TYPE_FILTERS from '../generic/constants';
import VideoInfoModalSidebar from './info-sidebar';

const VideosPage = ({
  courseId,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const [isTranscriptSettingsOpen, openTranscriptSettings, closeTranscriptSettings] = useToggle(false);
  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.heading));

  useEffect(() => {
    dispatch(fetchVideos(courseId));
  }, [courseId]);

  const {
    videoIds,
    loadingStatus,
    transcriptStatus,
    addingStatus: addVideoStatus,
    deletingStatus: deleteVideoStatus,
    updatingStatus: updateVideoStatus,
    usageStatus: usagePathStatus,
    errors: errorMessages,
    pageSettings,
  } = useSelector(state => state.videos);

  const {
    isVideoTranscriptEnabled,
    encodingsDownloadUrl,
    videoUploadMaxFileSize,
    videoSupportedFileFormats,
    videoImageSettings,
  } = pageSettings;

  const supportedFileFormats = { 'video/*': videoSupportedFileFormats || FILES_AND_UPLOAD_TYPE_FILTERS.video };

  const handleAddFile = (file) => dispatch(addVideoFile(courseId, file));
  const handleDeleteFile = (id) => dispatch(deleteVideoFile(courseId, id));
  const handleDownloadFile = (selectedRows) => dispatch(fetchVideoDownload({ selectedRows }));
  const handleUsagePaths = (video) => dispatch(getUsagePaths({ video, courseId }));
  const handleErrorReset = (error) => dispatch(resetErrors(error));
  const handleFileOrder = ({ newFileIdOrder, sortType }) => {
    dispatch(updateVideoOrder(courseId, newFileIdOrder, sortType));
  };
  const handleAddThumbnail = (file, videoId) => resampleFile({
    file,
    dispatch,
    courseId,
    videoId,
    addVideoThumbnail,
  });

  const videos = useModels('videos', videoIds);

  const data = {
    supportedFileFormats,
    encodingsDownloadUrl,
    fileIds: videoIds,
    loadingStatus,
    usagePathStatus,
    usageErrorMessages: errorMessages.usageMetrics,
  };
  const thumbnailPreview = (props) => VideoThumbnail({ ...props, handleAddThumbnail, videoImageSettings });
  const infoModalSidebar = (video) => VideoInfoModalSidebar({ video });
  const maxFileSize = videoUploadMaxFileSize * 1073741824;
  const transcriptColumn = {
    id: 'transcripts',
    Header: 'Transcript',
    accessor: (({ transcripts }) => !isEmpty(transcripts)),
    Cell: ({ row }) => {
      const { transcripts } = row.original;
      const numOfTranscripts = transcripts?.length;
      return numOfTranscripts > 0 ? `(${numOfTranscripts}) available` : null;
    },
    Filter: CheckboxFilter,
    filterChoices: [
      { name: intl.formatMessage(messages.transcribedCheckboxLabel), value: true },
      { name: intl.formatMessage(messages.notTranscribedCheckboxLabel), value: false },
    ],
  };
  const activeColumn = {
    id: 'usageLocations',
    Header: 'Active',
    accessor: (({ usageLocations }) => !isEmpty(usageLocations)),
    Cell: ({ row }) => ActiveColumn({ row }),
    Filter: CheckboxFilter,
    filterChoices: [
      { name: intl.formatMessage(messages.activeCheckboxLabel), value: true },
      { name: intl.formatMessage(messages.inactiveCheckboxLabel), value: false },
    ],
  };
  const durationColumn = {
    id: 'duration',
    Header: 'Video length',
    accessor: 'duration',
    Cell: ({ row }) => {
      const { duration } = row.original;
      return getFormattedDuration(duration);
    },
  };
  const processingStatusColumn = {
    id: 'status',
    Header: '',
    Cell: ({ row }) => StatusColumn({ row }),
    Filter: CheckboxFilter,
    filterChoices: [{ name: intl.formatMessage(messages.processingCheckboxLabel), value: 'Processing' }],
  };
  const videoThumbnailColumn = {
    id: 'courseVideoImageUrl',
    Header: '',
    Cell: ({ row }) => ThumbnailColumn({ row, thumbnailPreview }),
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
    <VideosPageProvider courseId={courseId}>
      <main>
        <div className="p-4">
          <EditFileErrors
            resetErrors={handleErrorReset}
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
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  openTranscriptSettings();
                  handleErrorReset({ errorType: 'transcript' });
                }}
              >
                <FormattedMessage {...messages.transcriptSettingsButtonLabel} />
              </Button>
            ) : null}
          </ActionRow>
        </div>
        {isVideoTranscriptEnabled ? (
          <TranscriptSettings
            {...{
              isTranscriptSettingsOpen,
              closeTranscriptSettings,
              handleErrorReset,
              errorMessages,
              transcriptStatus,
              courseId,
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
            handleUsagePaths,
            handleErrorReset,
            handleFileOrder,
            tableColumns,
            maxFileSize,
            thumbnailPreview,
            infoModalSidebar,
            files: videos,
          }}
        />
      </main>
    </VideosPageProvider>
  );
};

VideosPage.propTypes = {
  courseId: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(VideosPage);

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import {
  injectIntl,
  FormattedMessage,
  intlShape,
} from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  CheckboxFilter,
  Container,
  useToggle,
} from '@openedx/paragon';

import Placeholder from '../../editors/Placeholder';
import { RequestStatus } from '../../data/constants';
import { useModels, useModel } from '../../generic/model-store';
import {
  addVideoFile,
  addVideoThumbnail,
  deleteVideoFile,
  fetchVideoDownload,
  fetchVideos,
  getUsagePaths,
  markVideoUploadsInProgressAsFailed,
  resetErrors,
  updateVideoOrder,
  cancelAllUploads,
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
  TranscriptColumn,
} from '../generic';
import { getFormattedDuration, resampleFile } from './data/utils';
import FILES_AND_UPLOAD_TYPE_FILTERS from '../generic/constants';
import TranscriptSettings from './transcript-settings';
import VideoInfoModalSidebar from './info-sidebar';
import VideoThumbnail from './VideoThumbnail';
import UploadModal from './upload-modal';

const VideosPage = ({
  courseId,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const [
    isTranscriptSettingsOpen,
    openTranscriptSettings,
    closeTranscriptSettings,
  ] = useToggle(false);
  const [
    isUploadTrackerOpen,
    openUploadTracker,
    closeUploadTracker,
  ] = useToggle(false);
  const courseDetails = useModel('courseDetails', courseId);

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
  } = useSelector((state) => state.videos);

  const uploadingIdsRef = useRef({ uploadData: {}, uploadCount: 0 });

  useEffect(() => {
    window.onbeforeunload = () => {
      dispatch(markVideoUploadsInProgressAsFailed({ uploadingIdsRef, courseId }));
      if (addVideoStatus === RequestStatus.IN_PROGRESS) {
        return '';
      }
      return undefined;
    };
    switch (addVideoStatus) {
      case RequestStatus.IN_PROGRESS:
        openUploadTracker();
        break;
      case RequestStatus.SUCCESSFUL:
        setTimeout(() => closeUploadTracker(), 500);
        break;
      case RequestStatus.FAILED:
        setTimeout(() => closeUploadTracker(), 500);
        break;
      default:
        closeUploadTracker();
        break;
    }
  }, [addVideoStatus]);

  const {
    isVideoTranscriptEnabled,
    encodingsDownloadUrl,
    videoUploadMaxFileSize,
    videoSupportedFileFormats,
    videoImageSettings,
  } = pageSettings;

  const supportedFileFormats = {
    'video/*': videoSupportedFileFormats || FILES_AND_UPLOAD_TYPE_FILTERS.video,
  };
  const handleUploadCancel = () => dispatch(cancelAllUploads(courseId, uploadingIdsRef.current.uploadData));
  const handleErrorReset = (error) => dispatch(resetErrors(error));
  const handleAddFile = (files) => {
    handleErrorReset({ errorType: 'add' });
    uploadingIdsRef.current.uploadCount = files.length;
    dispatch(addVideoFile(courseId, files, videoIds, uploadingIdsRef));
  };
  const handleDeleteFile = (id) => dispatch(deleteVideoFile(courseId, id));
  const handleDownloadFile = (selectedRows) => dispatch(fetchVideoDownload({ selectedRows, courseId }));
  const handleUsagePaths = (video) => dispatch(getUsagePaths({ video, courseId }));
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
    fileType: 'video',
  };
  const thumbnailPreview = (props) => VideoThumbnail({
    ...props,
    pageLoadStatus: loadingStatus,
    handleAddThumbnail,
    videoImageSettings,
  });
  const infoModalSidebar = (video, activeTab, setActiveTab) => (
    VideoInfoModalSidebar({ video, activeTab, setActiveTab })
  );
  const maxFileSize = videoUploadMaxFileSize * 1073741824;
  const transcriptColumn = {
    id: 'transcriptStatus',
    Header: 'Transcript',
    accessor: 'transcriptStatus',
    Cell: ({ row }) => TranscriptColumn({ row }),
    Filter: CheckboxFilter,
    filter: 'exactTextCase',
    filterChoices: [
      {
        name: intl.formatMessage(messages.transcribedCheckboxLabel),
        value: 'transcribed',
      },
      {
        name: intl.formatMessage(messages.notTranscribedCheckboxLabel),
        value: 'notTranscribed',
      },
    ],
  };
  const activeColumn = {
    id: 'activeStatus',
    Header: 'Active',
    accessor: 'activeStatus',
    Cell: ({ row }) => ActiveColumn({ row, pageLoadStatus: loadingStatus }),
    Filter: CheckboxFilter,
    filter: 'exactTextCase',
    filterChoices: [
      { name: intl.formatMessage(messages.activeCheckboxLabel), value: 'active' },
      { name: intl.formatMessage(messages.inactiveCheckboxLabel), value: 'inactive' },
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
    Header: 'Status',
    accessor: 'status',
    Cell: ({ row }) => StatusColumn({ row }),
    Filter: CheckboxFilter,
    filterChoices: [
      { name: intl.formatMessage(messages.processingCheckboxLabel), value: 'Processing' },

      { name: intl.formatMessage(messages.failedCheckboxLabel), value: 'Failed' },
    ],
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
        {loadingStatus !== RequestStatus.FAILED && (
          <>
            {isVideoTranscriptEnabled && (
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
            )}
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
          </>
        )}
        <UploadModal
          {...{
            isUploadTrackerOpen,
            currentUploadingIdsRef: uploadingIdsRef.current,
            handleUploadCancel,
            addVideoStatus,
          }}
        />
      </Container>
    </VideosPageProvider>
  );
};

VideosPage.propTypes = {
  courseId: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(VideosPage);

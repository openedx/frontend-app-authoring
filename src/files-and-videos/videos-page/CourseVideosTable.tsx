import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, CheckboxFilter, useToggle,
} from '@openedx/paragon';
import { AgreementGated } from '@src/constants';
import { RequestStatus } from '@src/data/constants';
import {
  ActiveColumn,
  FileTable,
  StatusColumn,
  ThumbnailColumn,
  TranscriptColumn,
} from '@src/files-and-videos/generic';
import FILES_AND_UPLOAD_TYPE_FILTERS from '@src/files-and-videos/generic/constants';
import {
  addVideoFile,
  addVideoThumbnail,
  cancelAllUploads,
  deleteVideoFile,
  fetchVideoDownload,
  getUsagePaths,
  markVideoUploadsInProgressAsFailed,
  newUploadData,
  resetErrors,
  updateVideoOrder,
} from '@src/files-and-videos/videos-page/data/thunks';
import { getFormattedDuration, resampleFile } from '@src/files-and-videos/videos-page/data/utils';
import VideoInfoModalSidebar from '@src/files-and-videos/videos-page/info-sidebar';
import messages from '@src/files-and-videos/videos-page/messages';
import TranscriptSettings from '@src/files-and-videos/videos-page/transcript-settings';
import UploadModal from '@src/files-and-videos/videos-page/upload-modal';
import VideoThumbnail from '@src/files-and-videos/videos-page/VideoThumbnail';
import { GatedComponentWrapper } from '@src/generic/agreement-gated-feature';
import { useModels } from '@src/generic/model-store';
import { DeprecatedReduxState } from '@src/store';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

export const CourseVideosTable = () => {
  const intl = useIntl();
  const { courseId } = useParams() as { courseId: string };
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

  const {
    videoIds,
    loadingStatus,
    transcriptStatus,
    addingStatus: addVideoStatus,
    usageStatus: usagePathStatus,
    errors: errorMessages,
    pageSettings,
  } = useSelector((state: DeprecatedReduxState) => state.videos);

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

    files.forEach((file, idx) => {
      const name = file?.name || `Video ${idx + 1}`;
      const progress = 0;

      newUploadData({
        status: RequestStatus.PENDING,
        currentData: uploadingIdsRef.current.uploadData,
        originalValue: { name, progress },
        key: `video_${idx}`,
        edxVideoId: undefined,
      });
    });
    dispatch(addVideoFile(courseId, files, videoIds, uploadingIdsRef));
  };
  const handleDeleteFile = (id) => dispatch(deleteVideoFile(courseId, id));
  const handleDownloadFile = (selectedRows) => dispatch(fetchVideoDownload({
    selectedRows,
    courseId,
  }));
  const handleUsagePaths = (video) => dispatch(getUsagePaths({ video, courseId }));
  const handleFileOrder = ({ newFileIdOrder }) => {
    dispatch(updateVideoOrder(courseId, newFileIdOrder));
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
    <VideoInfoModalSidebar video={video} activeTab={activeTab} setActiveTab={setActiveTab} />
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

  return (
    <GatedComponentWrapper gatingTypes={[AgreementGated.UPLOAD, AgreementGated.UPLOAD_VIDEOS]}>
      <>
        <ActionRow>
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
              {intl.formatMessage(messages.transcriptSettingsButtonLabel)}
            </Button>
          ) : null}
        </ActionRow>
        {
        loadingStatus !== RequestStatus.FAILED && (
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
        )
    }
        <UploadModal
          {...{
            isUploadTrackerOpen,
            currentUploadingIdsRef: uploadingIdsRef.current,
            handleUploadCancel,
            addVideoStatus,
          }}
        />
      </>
    </GatedComponentWrapper>
  );
};

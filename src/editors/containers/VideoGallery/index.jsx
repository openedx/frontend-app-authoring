import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Image, useToggle, StandardModal,
} from '@openedx/paragon';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectors } from '../../data/redux';
import * as hooks from './hooks';
import SelectionModal from '../../sharedComponents/SelectionModal';
import { acceptedImgKeys } from './utils';
import messages from './messages';
import { RequestKeys } from '../../data/constants/requests';
import videoThumbnail from '../../data/images/videoThumbnail.svg';
import VideoUploadEditor from '../VideoUploadEditor';
import VideoEditor from '../VideoEditor';

const VideoGallery = ({ returnFunction, onCancel }) => {
  const intl = useIntl();
  const rawVideos = useSelector(selectors.app.videos);
  const isLoaded = useSelector(
    (state) => selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchVideos }),
  );
  const isFetchError = useSelector(
    (state) => selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchVideos }),
  );
  const isUploadError = useSelector(
    (state) => selectors.requests.isFailed(state, { requestKey: RequestKeys.uploadVideo }),
  );
  const videos = hooks.buildVideos({ rawVideos });
  const [isVideoUploadModalOpen, showVideoUploadModal, closeVideoUploadModal] = useToggle();
  const [isVideoEditorModalOpen, showVideoEditorModal, closeVideoEditorModal] = useToggle();
  const setSearchParams = useSearchParams()[1];

  useEffect(() => {
    // If no videos exists opens to the video upload modal
    if (isLoaded && videos.length === 0) {
      showVideoUploadModal();
    }
  }, [isLoaded]);

  const onVideoUpload = useCallback((videoUrl) => {
    closeVideoUploadModal();
    showVideoEditorModal();
    setSearchParams({ selectedVideoUrl: videoUrl });
  }, [closeVideoUploadModal, showVideoEditorModal, setSearchParams]);

  const uploadHandler = useCallback(() => {
    showVideoUploadModal();
  });

  const {
    galleryError,
    inputError,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  } = hooks.useVideoProps({ videos, uploadHandler, returnFunction });
  const handleCancel = hooks.useCancelHandler();

  const modalMessages = {
    confirmMsg: messages.selectVideoButtonlabel,
    titleMsg: messages.titleLabel,
    uploadButtonMsg: messages.uploadButtonLabel,
    fetchError: messages.fetchVideosError,
    uploadError: messages.uploadVideoError,
  };

  const thumbnailFallback = (
    <Image
      thumbnail
      className="px-6 py-4.5 h-100"
      src={videoThumbnail}
    />
  );

  return (
    <div style={isLoaded ? { backgroundColor: '#E9E6E4' } : {}}>
      <SelectionModal
        {...{
          isOpen: true,
          close: onCancel || handleCancel,
          size: 'xl',
          isFullscreenScroll: false,
          galleryError,
          inputError,
          fileInput,
          galleryProps: {
            ...galleryProps,
            thumbnailFallback,
          },
          searchSortProps,
          selectBtnProps,
          acceptedFiles: acceptedImgKeys,
          modalMessages,
          isLoaded,
          isUploadError,
          isFetchError,
        }}
      />
      <StandardModal
        title={intl.formatMessage(messages.videoUploadModalTitle)}
        isOpen={isVideoUploadModalOpen}
        onClose={closeVideoUploadModal}
        isOverflowVisible={false}
        size="xl"
        hasCloseButton={false}
      >
        <div className="editor-page">
          <VideoUploadEditor
            onUpload={onVideoUpload}
            onClose={closeVideoUploadModal}
          />
        </div>
      </StandardModal>
      {isVideoEditorModalOpen && (
        <VideoEditor
          onClose={closeVideoEditorModal}
          returnFunction={returnFunction}
        />
      )}
    </div>
  );
};

VideoGallery.propTypes = {
  onCancel: PropTypes.func,
  returnFunction: PropTypes.func,
};

export default VideoGallery;

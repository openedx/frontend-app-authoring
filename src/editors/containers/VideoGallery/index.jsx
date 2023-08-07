import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectors } from '../../data/redux';
import hooks from './hooks';
import SelectionModal from '../../sharedComponents/SelectionModal';
import { acceptedImgKeys } from './utils';
import messages from './messages';
import { RequestKeys } from '../../data/constants/requests';

export const VideoGallery = () => {
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
  const handleVideoUpload = hooks.useVideoUploadHandler();

  useEffect(() => {
    // If no videos exists redirects to the video upload screen
    if (isLoaded && videos.length === 0) {
      handleVideoUpload();
    }
  }, [isLoaded]);
  const {
    galleryError,
    inputError,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  } = hooks.useVideoProps({ videos });
  const handleCancel = hooks.useCancelHandler();

  const modalMessages = {
    confirmMsg: messages.selectVideoButtonlabel,
    titleMsg: messages.titleLabel,
    uploadButtonMsg: messages.uploadButtonLabel,
    fetchError: messages.fetchVideosError,
    uploadError: messages.uploadVideoError,
  };

  return (
    <SelectionModal
      {...{
        isOpen: true,
        close: handleCancel,
        size: 'fullscreen',
        isFullscreenScroll: false,
        galleryError,
        inputError,
        fileInput,
        galleryProps,
        searchSortProps,
        selectBtnProps,
        acceptedFiles: acceptedImgKeys,
        modalMessages,
        isLoaded,
        isUploadError,
        isFetchError,
      }}
    />
  );
};

VideoGallery.propTypes = {};

export default VideoGallery;

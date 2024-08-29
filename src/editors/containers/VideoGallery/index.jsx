import React, { useEffect } from 'react';
import { Image } from '@openedx/paragon';
import { useSelector } from 'react-redux';
import { selectors } from '../../data/redux';
import * as hooks from './hooks';
import SelectionModal from '../../sharedComponents/SelectionModal';
import { acceptedImgKeys } from './utils';
import messages from './messages';
import { RequestKeys } from '../../data/constants/requests';
import videoThumbnail from '../../data/images/videoThumbnail.svg';

const VideoGallery = () => {
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
  const handleVideoUpload = hooks.useVideoUploadHandler({ replace: true });

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
          close: handleCancel,
          size: 'fullscreen',
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
    </div>
  );
};

VideoGallery.propTypes = {};

export default VideoGallery;

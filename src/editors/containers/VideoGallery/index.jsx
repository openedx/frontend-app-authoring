import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectors } from '../../data/redux';
import hooks from './hooks';
import SelectionModal from '../../sharedComponents/SelectionModal';
import { acceptedImgKeys } from './utils';
import messages from './messages';
import { RequestKeys } from '../../data/constants/requests';

export const VideoGallery = ({
  // redux
  rawVideos,
  isLoaded,
  isFetchError,
  isUploadError,
}) => {
  const videos = hooks.buildVideos({ rawVideos });
  const {
    galleryError,
    inputError,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  } = hooks.videoProps({ videos });

  const modalMessages = {
    confirmMsg: messages.selectVideoButtonlabel,
    titleMsg: messages.titleLabel,
    uploadButtonMsg: messages.uploadButtonLabel,
    fetchError: messages.fetchVideosError,
    uploadError: messages.uploadVideoError,
  };

  return (
    <div>
      <SelectionModal
        {...{
          isOpen: true,
          close: () => { /* TODO */ },
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
    </div>
  );
};

VideoGallery.propTypes = {
  rawVideos: PropTypes.shape({}).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  isFetchError: PropTypes.bool.isRequired,
  isUploadError: PropTypes.bool.isRequired,
};

export const mapStateToProps = (state) => ({
  rawVideos: selectors.app.videos(state),
  isLoaded: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchVideos }),
  isFetchError: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchVideos }),
  isUploadError: selectors.requests.isFailed(state, { requestKey: RequestKeys.uploadVideo }),
});

export const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(VideoGallery);

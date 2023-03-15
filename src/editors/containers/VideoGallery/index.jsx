import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectors } from '../../data/redux';
import hooks from './hooks';
import SelectionModal from '../../sharedComponents/SelectionModal';
import { acceptedImgKeys } from './utils';
import messages from './messages';

export const VideoGallery = ({
  // redux
  assets,
}) => {
  const videos = hooks.filterAssets({ assets });
  const {
    galleryError,
    inputError,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  } = hooks.videoHooks({ videos });

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
        }}
      />
    </div>
  );
};

VideoGallery.propTypes = {
  assets: PropTypes.shape({}).isRequired,
};

export const mapStateToProps = (state) => ({
  assets: selectors.app.assets(state),
});

export const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(VideoGallery);

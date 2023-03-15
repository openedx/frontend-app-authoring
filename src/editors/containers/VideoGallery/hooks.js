import React from 'react';
import * as module from './hooks';
import messages from './messages';
import {
  filterKeys,
  filterMessages,
  sortKeys,
  sortMessages,
} from './utils';

export const state = {
  highlighted: (val) => React.useState(val),
  searchString: (val) => React.useState(val),
  showSelectVideoError: (val) => React.useState(val),
  showSizeError: (val) => React.useState(val),
  sortBy: (val) => React.useState(val),
  filertBy: (val) => React.useState(val),
  hideSelectedVideos: (val) => React.useState(val),
};

export const searchAndSortHooks = () => {
  const [searchString, setSearchString] = module.state.searchString('');
  const [sortBy, setSortBy] = module.state.sortBy(sortKeys.dateNewest);
  const [filterBy, setFilterBy] = module.state.filertBy(filterKeys.videoStatus);
  const [hideSelectedVideos, setHideSelectedVideos] = module.state.hideSelectedVideos(false);

  return {
    searchString,
    onSearchChange: (e) => setSearchString(e.target.value),
    clearSearchString: () => setSearchString(''),
    sortBy,
    onSortClick: (key) => () => setSortBy(key),
    sortKeys,
    sortMessages,
    filterBy,
    onFilterClick: (key) => () => setFilterBy(key),
    filterKeys,
    filterMessages,
    showSwitch: true,
    hideSelectedVideos,
    switchMessage: messages.hideSelectedCourseVideosSwitchLabel,
    onSwitchClick: () => setHideSelectedVideos(!hideSelectedVideos),
  };
};

export const videoListHooks = ({ videos }) => {
  const [highlighted, setHighlighted] = module.state.highlighted(null);
  const [
    showSelectVideoError,
    setShowSelectVideoError,
  ] = module.state.showSelectVideoError(false);
  const [
    showSizeError,
    setShowSizeError,
  ] = module.state.showSizeError(false);
  const filteredList = videos; // TODO missing filters and sort
  return {
    galleryError: {
      show: showSelectVideoError,
      set: () => setShowSelectVideoError(true),
      dismiss: () => setShowSelectVideoError(false),
      message: messages.selectVideoError,
    },
    // TODO We need to update this message when implementing the video upload screen
    inputError: {
      show: showSizeError,
      set: () => setShowSizeError(true),
      dismiss: () => setShowSelectVideoError(false),
      message: messages.fileSizeError,
    },
    galleryProps: {
      galleryIsEmpty: Object.keys(filteredList).length === 0,
      searchIsEmpty: filteredList.length === 0,
      displayList: filteredList,
      highlighted,
      onHighlightChange: (e) => setHighlighted(e.target.value),
      emptyGalleryLabel: messages.emptyGalleryLabel,
      showIdsOnCards: true,
      height: '100%',
    },
    selectBtnProps: {
      onclick: () => {
        // TODO Update this when implementing the selection feature
      },
    },
  };
};

export const fileInputHooks = () => {
  // TODO [Update video] Implement this
  const ref = React.useRef();
  const click = () => ref.current.click();

  return {
    click,
    addFile: () => {},
    ref,
  };
};

export const filterAssets = ({ assets }) => {
  let videos = [];
  const assetsList = Object.values(assets);
  if (assetsList.length > 0) {
    videos = assetsList.filter(asset => asset?.contentType?.startsWith('video/'));
  }
  return videos;
};

export const videoHooks = ({ videos }) => {
  const searchSortProps = module.searchAndSortHooks();
  const videoList = module.videoListHooks({ videos });
  const {
    galleryError,
    galleryProps,
    inputError,
    selectBtnProps,
  } = videoList;
  const fileInput = module.fileInputHooks();

  return {
    galleryError,
    inputError,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  };
};

export default {
  videoHooks,
  filterAssets,
};

import React from 'react';
import { useSelector } from 'react-redux';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';
import messages from './messages';
import * as appHooks from '../../hooks';
import { selectors } from '../../data/redux';
import analyticsEvt from '../../data/constants/analyticsEvt';
import {
  filterKeys, filterMessages, sortFunctions, sortKeys, sortMessages,
} from './utils';

export const {
  navigateCallback,
  navigateTo,
} = appHooks;

export const useSearchAndSortProps = () => {
  const [searchString, setSearchString] = React.useState('');
  const [sortBy, setSortBy] = React.useState(sortKeys.dateNewest);
  const [filterBy, setFilterBy] = React.useState(filterKeys.anyStatus);
  const [hideSelectedVideos, setHideSelectedVideos] = React.useState(false);

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
    showSwitch: false,
    hideSelectedVideos,
    switchMessage: messages.hideSelectedCourseVideosSwitchLabel,
    onSwitchClick: () => setHideSelectedVideos(!hideSelectedVideos),
  };
};

export const filterListBySearch = ({
  searchString,
  videoList,
}) => (
  videoList.filter(({ displayName }) => displayName.toLowerCase()
    .includes(searchString.toLowerCase()))
);

export const filterListByStatus = ({ statusFilter, videoList }) => {
  if (statusFilter === filterKeys.anyStatus) {
    return videoList;
  }
  return videoList.filter(({ status }) => filterKeys[statusFilter] === status);
};

export const filterListByHideSelectedCourse = ({ videoList }) => (
  // TODO Missing to implement this
  videoList
);

export const filterList = ({
  sortBy,
  filterBy,
  searchString,
  videos,
}) => {
  let filteredList = module.filterListBySearch({
    searchString,
    videoList: videos,
  });
  filteredList = module.filterListByStatus({
    statusFilter: filterBy,
    videoList: filteredList,
  });
  filteredList = module.filterListByHideSelectedCourse({
    videoList: filteredList,
  });
  return filteredList.sort(sortFunctions[sortBy in sortKeys ? sortKeys[sortBy] : sortKeys.dateNewest]);
};

export const useVideoListProps = ({
  searchSortProps,
  videos,
}) => {
  const [highlighted, setHighlighted] = React.useState(null);
  const [
    showSelectVideoError,
    setShowSelectVideoError,
  ] = React.useState(false);
  const [
    showSizeError,
    setShowSizeError,
  ] = React.useState(false);
  const filteredList = module.filterList({
    ...searchSortProps,
    videos,
  });
  const learningContextId = useSelector(selectors.app.learningContextId);
  const blockId = useSelector(selectors.app.blockId);
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
      onClick: () => {
        if (highlighted) {
          navigateTo(`/course/${learningContextId}/editor/video/${blockId}?selectedVideoId=${highlighted}`);
        } else {
          setShowSelectVideoError(true);
        }
      },
    },
  };
};

export const useVideoUploadHandler = ({ replace }) => {
  const learningContextId = useSelector(selectors.app.learningContextId);
  const blockId = useSelector(selectors.app.blockId);
  const path = `/course/${learningContextId}/editor/video_upload/${blockId}`;
  if (replace) {
    return () => window.location.replace(path);
  }
  return () => navigateTo(path);
};

export const useCancelHandler = () => (
  navigateCallback({
    destination: useSelector(selectors.app.returnUrl),
    analytics: useSelector(selectors.app.analytics),
    analyticsEvent: analyticsEvt.videoGalleryCancelClick,
  })
);

export const buildVideos = ({ rawVideos }) => {
  let videos = [];
  const rawVideoList = Object.values(rawVideos);
  if (rawVideoList.length > 0) {
    videos = rawVideoList.map(video => ({
      id: video.edx_video_id,
      displayName: video.client_video_id,
      externalUrl: video.course_video_image_url,
      dateAdded: new Date(video.created),
      locked: false,
      thumbnail: video.course_video_image_url,
      status: video.status_nontranslated,
      statusBadgeVariant: module.getstatusBadgeVariant({ status: video.status_nontranslated }),
      statusMessage: module.getStatusMessage({ status: video.status_nontranslated }),
      duration: video.duration,
      transcripts: video.transcripts,
    }));
  }
  return videos;
};

export const getstatusBadgeVariant = ({ status }) => {
  switch (status) {
    case filterKeys.failed:
      return 'danger';
    case filterKeys.uploading:
    case filterKeys.processing:
      return 'light';
    default:
      return null;
  }
};

export const getStatusMessage = ({ status }) => Object.values(filterMessages).find((m) => m.defaultMessage === status);

export const useVideoProps = ({ videos }) => {
  const searchSortProps = useSearchAndSortProps();
  const videoList = useVideoListProps({
    searchSortProps,
    videos,
  });
  const {
    galleryError,
    galleryProps,
    inputError,
    selectBtnProps,
  } = videoList;
  const fileInput = { click: useVideoUploadHandler({ replace: false }) };

  return {
    galleryError,
    inputError,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  };
};

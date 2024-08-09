import React from 'react';
import { useDispatch } from 'react-redux';

import { thunkActions } from '../../../data/redux';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';
import { sortFunctions, sortKeys, sortMessages } from './utils';
import messages from './messages';

export const state = {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  highlighted: (val) => React.useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  showSelectImageError: (val) => React.useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  searchString: (val) => React.useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  sortBy: (val) => React.useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  showSizeError: (val) => React.useState(val),
};

export const searchAndSortHooks = () => {
  const [searchString, setSearchString] = module.state.searchString('');
  const [sortBy, setSortBy] = module.state.sortBy(sortKeys.dateNewest);
  return {
    searchString,
    onSearchChange: (e) => setSearchString(e.target.value),
    clearSearchString: () => setSearchString(''),
    sortBy,
    onSortClick: (key) => () => setSortBy(key),
    sortKeys,
    sortMessages,
  };
};

export const filteredList = ({ searchString, imageList }) => (
  imageList.filter(({ displayName }) => displayName?.toLowerCase().includes(searchString?.toLowerCase()))
);

export const displayList = ({ sortBy, searchString, images }) => (
  module.filteredList({
    searchString,
    imageList: images,
  }).sort(sortFunctions[sortBy in sortKeys ? sortKeys[sortBy] : sortKeys.dateNewest]));

export const imgListHooks = ({
  searchSortProps,
  setSelection,
  images,
  imageCount,
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dispatch = useDispatch();
  const [highlighted, setHighlighted] = module.state.highlighted(null);
  const [
    showSelectImageError,
    setShowSelectImageError,
  ] = module.state.showSelectImageError(false);
  const [showSizeError, setShowSizeError] = module.state.showSizeError(false);
  const list = module.displayList({ ...searchSortProps, images });

  return {
    galleryError: {
      show: showSelectImageError,
      set: () => setShowSelectImageError(true),
      dismiss: () => setShowSelectImageError(false),
      message: messages.selectImageError,
    },
    inputError: {
      show: showSizeError,
      set: () => setShowSizeError(true),
      dismiss: () => setShowSizeError(false),
      message: messages.fileSizeError,
    },
    images,
    galleryProps: {
      galleryIsEmpty: Object.keys(images).length === 0,
      searchIsEmpty: list.length === 0,
      displayList: list,
      highlighted,
      onHighlightChange: (e) => setHighlighted(e.target.value),
      emptyGalleryLabel: messages.emptyGalleryLabel,
      allowLazyLoad: true,
      fetchNextPage: ({ pageNumber }) => dispatch(thunkActions.app.fetchImages({ pageNumber })),
      assetCount: imageCount,
    },
    // highlight by id
    selectBtnProps: {
      onClick: () => {
        if (highlighted) {
          const highlightedImage = images.find(image => image.id === highlighted);
          setSelection(highlightedImage);
        } else {
          setShowSelectImageError(true);
        }
      },
    },
  };
};

export const checkValidFileSize = ({
  selectedFile,
  clearSelection,
  onSizeFail,
}) => {
  // Check if the file size is greater than 10 MB, upload size limit
  if (selectedFile.size > 10000000) {
    clearSelection();
    onSizeFail();
    return false;
  }
  return true;
};

export const fileInputHooks = ({ setSelection, clearSelection, imgList }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dispatch = useDispatch();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = React.useRef();
  const click = () => ref.current.click();
  const addFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && module.checkValidFileSize({
      selectedFile,
      clearSelection,
      onSizeFail: () => {
        imgList.inputError.set();
      },
    })) {
      dispatch(
        thunkActions.app.uploadAsset({
          file: selectedFile,
          setSelection,
        }),
      );
    }
  };

  return {
    click,
    addFile,
    ref,
  };
};

export const imgHooks = ({
  setSelection,
  clearSelection,
  images,
  imageCount,
}) => {
  const searchSortProps = module.searchAndSortHooks();
  const imgList = module.imgListHooks({
    setSelection,
    searchSortProps,
    images,
    imageCount,
  });
  const fileInput = module.fileInputHooks({
    setSelection,
    clearSelection,
    imgList,
  });
  const {
    galleryError,
    galleryProps,
    inputError,
    selectBtnProps,
  } = imgList;

  return {
    galleryError,
    inputError,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  };
};

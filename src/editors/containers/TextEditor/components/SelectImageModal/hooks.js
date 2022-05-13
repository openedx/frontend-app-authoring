import React from 'react';
import { useDispatch } from 'react-redux';

import { thunkActions } from '../../../../data/redux';
import * as module from './hooks';
import { sortFunctions, sortKeys } from './utils';

export const state = {
  highlighted: (val) => React.useState(val),
  images: (val) => React.useState(val),
  showSelectImageError: (val) => React.useState(val),
  searchString: (val) => React.useState(val),
  sortBy: (val) => React.useState(val),
};

export const searchAndSortHooks = () => {
  const [searchString, setSearchString] = module.state.searchString('');
  const [sortBy, setSortBy] = module.state.sortBy(sortKeys.dateNewest);
  return {
    searchString,
    onSearchChange: e => setSearchString(e.target.value),
    clearSearchString: () => setSearchString(''),
    sortBy,
    onSortClick: key => () => setSortBy(key),
  };
};

export const filteredList = ({ searchString, imageList }) => imageList.filter(
  ({ displayName }) => displayName.toLowerCase().includes(searchString.toLowerCase()),
);

export const displayList = ({ sortBy, searchString, images }) => module.filteredList({
  searchString,
  imageList: Object.values(images),
}).sort(sortFunctions[sortBy in sortKeys ? sortKeys[sortBy] : sortKeys.dateNewest]);

export const imgListHooks = ({
  searchSortProps,
  setSelection,
}) => {
  const dispatch = useDispatch();
  const [images, setImages] = module.state.images({});
  const [highlighted, setHighlighted] = module.state.highlighted(null);
  const [showSelectImageError, setShowSelectImageError] = module.state.showSelectImageError(false);
  const list = module.displayList({ ...searchSortProps, images });

  React.useEffect(() => {
    dispatch(thunkActions.app.fetchImages({ setImages }));
  }, []);

  return {
    error: {
      show: showSelectImageError,
      set: () => setShowSelectImageError(true),
      dismiss: () => setShowSelectImageError(false),
    },
    images,
    galleryProps: {
      galleryIsEmpty: Object.keys(images).length === 0,
      searchIsEmpty: list.length === 0,
      displayList: list,
      highlighted,
      onHighlightChange: e => setHighlighted(e.target.value),
    },
    // highlight by id
    selectBtnProps: {
      onClick: () => {
        if (highlighted) {
          setSelection(images[highlighted]);
        } else {
          setShowSelectImageError(true);
        }
      },
    },
  };
};

export const fileInputHooks = ({ setSelection }) => {
  const dispatch = useDispatch();
  const ref = React.useRef();
  const click = () => ref.current.click();
  const addFile = (e) => {
    dispatch(thunkActions.app.uploadImage({
      file: e.target.files[0],
      setSelection,
    }));
  };

  return {
    click,
    addFile,
    ref,
  };
};

export const imgHooks = ({ setSelection }) => {
  const searchSortProps = module.searchAndSortHooks();
  const imgList = module.imgListHooks({ setSelection, searchSortProps });
  const fileInput = module.fileInputHooks({ setSelection });
  const {
    error,
    galleryProps,
    selectBtnProps,
  } = imgList;

  return {
    error,
    fileInput,
    galleryProps,
    searchSortProps,
    selectBtnProps,
  };
};

export default {
  imgHooks,
};

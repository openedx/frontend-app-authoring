import React from 'react';
import * as module from './hooks';
import { sortFunctions, sortKeys } from './utils';

export const state = {
  images: (val) => React.useState(val),
  highlighted: (val) => React.useState(val),
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
  fetchImages,
  setSelection,
  searchSortProps,
}) => {
  const [images, setImages] = module.state.images({});
  const [highlighted, setHighlighted] = module.state.highlighted(null);

  React.useEffect(() => {
    fetchImages({ onSuccess: setImages });
  }, []);

  return {
    images,
    // highlight by id
    selectBtnProps: {
      disabled: !highlighted,
      onClick: () => setSelection(images[highlighted]),
    },
    galleryProps: {
      highlighted,
      onHighlightChange: e => setHighlighted(e.target.value),
      displayList: module.displayList({ ...searchSortProps, images }),
    },
  };
};

export const fileInputHooks = ({ uploadImage }) => {
  const ref = React.useRef();
  const click = () => ref.current.click();
  const resetFile = () => { ref.current.value = ''; };
  const addFile = (e) => uploadImage({
    file: e.target.files[0],
    resetFile,
  });
  return {
    click,
    addFile,
    ref,
  };
};

export const imgHooks = ({ fetchImages, uploadImage, setSelection }) => {
  const searchSortProps = module.searchAndSortHooks();
  const imgList = module.imgListHooks({ fetchImages, setSelection, searchSortProps });
  const fileInput = module.fileInputHooks({ uploadImage });
  const { selectBtnProps, galleryProps } = imgList;

  return {
    fileInput,
    galleryProps,
    selectBtnProps,
    searchSortProps,
  };
};

export default {
  imgHooks,
};

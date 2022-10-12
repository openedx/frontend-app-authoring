import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkActions } from '../../../../../../data/redux';

export const fileInput = ({ setThumbnailSrc }) => {
  const dispatch = useDispatch();
  const ref = React.useRef();
  const click = () => ref.current.click();
  const addFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const image = file;
    reader.onload = () => {
      setThumbnailSrc(reader.result);
    };
    if (image) {
      reader.readAsDataURL(image);
      dispatch(thunkActions.video.uploadThumbnail({ thumbnail: image }));
    }
  };
  return {
    click,
    addFile,
    ref,
  };
};

export default {
  fileInput,
};

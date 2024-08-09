import React from 'react';
import { useDispatch } from 'react-redux';
import { thunkActions } from '../../../../../../data/redux';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';

export const state = {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  showSizeError: (args) => React.useState(args),
};

export const parseHandoutName = ({ handout }) => {
  if (handout) {
    const handoutName = handout.slice(handout.lastIndexOf('@') + 1);
    return handoutName;
  }
  return 'None';
};

export const checkValidFileSize = ({
  file,
  onSizeFail,
}) => {
  // Check if the file size is greater than 20 MB, upload size limit
  if (file.size > 20000000) {
    onSizeFail();
    return false;
  }
  return true;
};

export const fileInput = ({ fileSizeError }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dispatch = useDispatch();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = React.useRef();
  const click = () => ref.current.click();
  const addFile = (e) => {
    const file = e.target.files[0];
    if (file && module.checkValidFileSize({
      file,
      onSizeFail: () => {
        fileSizeError.set();
      },
    })) {
      dispatch(thunkActions.video.uploadHandout({
        file,
      }));
    }
  };
  return {
    click,
    addFile,
    ref,
  };
};

export const fileSizeError = () => {
  const [showSizeError, setShowSizeError] = module.state.showSizeError(false);
  return {
    fileSizeError: {
      show: showSizeError,
      set: () => setShowSizeError(true),
      dismiss: () => setShowSizeError(false),
    },
  };
};

export default { fileInput, fileSizeError, parseHandoutName };

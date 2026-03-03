import {thunkActions} from "@src/editors/data/redux";
import {useDispatch} from "react-redux";
import React from "react";
import {checkValidFileSize} from "@src/editors/hooks";

export const fetchPdfContent = () => ({ dispatch }) => (
  dispatch(thunkActions.pdf.savePdfData())
);

export const fileInput = ({ fileSizeError }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dispatch = useDispatch();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = React.useRef<HTMLElement>();
  const click = () => {ref.current && ref.current.click()};
  const addFile = (e) => {
    const file = e.target.files[0];
    if (file && checkValidFileSize({
      file,
      onSizeFail: () => {
        fileSizeError.set();
      },
    })) {
      dispatch(thunkActions.pdf.uploadAsset({
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

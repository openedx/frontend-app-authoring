import {EditorState, selectors} from "@src/editors/data/redux";
import {Dispatch} from "redux";
import * as requests from "@src/editors/data/redux/thunkActions/requests";
import {actions} from "../"

export const savePdfData = () => (_dispatch: Dispatch, getState: () => EditorState) => {
  const state = getState();
  return selectors.pdf.pdfState(state);
};

export const uploadPdf = ({ file }) => (dispatch: Dispatch) => {
  dispatch(requests.uploadAsset({
    asset: file,
    onSuccess: (response) => {
      const pdfUrl = response.data.asset.url;
      dispatch(actions.pdf.updateField({ pdfUrl }));
    },
  }));
};

export default {savePdfData}

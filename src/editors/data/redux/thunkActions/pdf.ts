import {EditorState, selectors} from "@src/editors/data/redux";
import {Dispatch} from "redux";

export const savePdfData = () => (_dispatch: Dispatch, getState: () => EditorState) => {
  const state = getState();
  return selectors.pdf.pdfState(state);
};

export default {savePdfData}

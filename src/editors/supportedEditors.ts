import TextEditor from './containers/TextEditor';
import VideoEditor from './containers/VideoEditor';
import ProblemEditor from './containers/ProblemEditor';
import VideoUploadEditor from './containers/VideoUploadEditor';
import GameEditor from './containers/GameEditor';

// ADDED_EDITOR_IMPORTS GO HERE

import { blockTypes } from './data/constants/app';
import PdfEditor from "@src/editors/containers/PdfEditor";

const supportedEditors = {
  [blockTypes.html]: TextEditor,
  [blockTypes.video]: VideoEditor,
  [blockTypes.problem]: ProblemEditor,
  [blockTypes.video_upload]: VideoUploadEditor,
  // ADDED_EDITORS GO BELOW
  [blockTypes.game]: GameEditor,
  [blockTypes.pdf]: PdfEditor,
} as const;

export default supportedEditors;

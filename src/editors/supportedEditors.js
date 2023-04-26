import TextEditor from './containers/TextEditor';
import VideoEditor from './containers/VideoEditor';
import ProblemEditor from './containers/ProblemEditor';

// ADDED_EDITOR_IMPORTS GO HERE
import VideoUploadEditor from './containers/VideoUploadEditor';

import { blockTypes } from './data/constants/app';

const supportedEditors = {
  [blockTypes.html]: TextEditor,
  [blockTypes.video]: VideoEditor,
  [blockTypes.problem]: ProblemEditor,
  // ADDED_EDITORS GO BELOW
  [blockTypes.video_upload]: VideoUploadEditor,
};

export default supportedEditors;

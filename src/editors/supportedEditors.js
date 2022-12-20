import TextEditor from './containers/TextEditor';
import VideoEditor from './containers/VideoEditor';
import ProblemEditor from './containers/ProblemEditor';

// ADDED_EDITOR_IMPORTS GO HERE

import { blockTypes } from './data/constants/app';

const supportedEditors = {
  [blockTypes.html]: TextEditor,
  [blockTypes.video]: VideoEditor,
  [blockTypes.problem]: ProblemEditor,
  // ADDED_EDITORS GO BELOW
};

export default supportedEditors;

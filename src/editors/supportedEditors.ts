import React from 'react';
import TextEditor from './containers/TextEditor';
import VideoEditor from './containers/VideoEditor';
import ProblemEditor from './containers/ProblemEditor';
import VideoUploadEditor from './containers/VideoUploadEditor';
import GamesEditor from './containers/GameEditor';
import InVideoQuiz from './containers/InVideoQuizEditor';

// ADDED_EDITOR_IMPORTS GO HERE

import { blockTypes } from './data/constants/app';
import type { EditorComponent } from './EditorComponent';

const supportedEditors: Record<string, React.ComponentType<EditorComponent>> = {
  [blockTypes.html]: TextEditor,
  [blockTypes.video]: VideoEditor,
  [blockTypes.problem]: ProblemEditor,
  [blockTypes.video_upload]: VideoUploadEditor,
  // ADDED_EDITORS GO BELOW
  [blockTypes.game]: GamesEditor,
  [blockTypes.invideoquiz]: InVideoQuiz,
};

export default supportedEditors;

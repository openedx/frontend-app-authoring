import PdfEditor from '@src/editors/containers/PdfEditor';
import TextEditor from './containers/TextEditor';
import VideoEditor from './containers/VideoEditor';
import ProblemEditor from './containers/ProblemEditor';
import VideoUploadEditor from './containers/VideoUploadEditor';
import GamesEditor from '@src/editors/containers/GamesEditor';
import FlashcardsEditor from '@src/editors/containers/FlashcardsEditor';

// ADDED_EDITOR_IMPORTS GO HERE

import { blockTypes } from './data/constants/app';

const supportedEditors = {
  [blockTypes.html]: TextEditor,
  [blockTypes.video]: VideoEditor,
  [blockTypes.problem]: ProblemEditor,
  [blockTypes.video_upload]: VideoUploadEditor,
  [blockTypes.pdf]: PdfEditor,
  // ADDED_EDITORS GO BELOW
  [blockTypes.games]: GamesEditor,
  [blockTypes.flashcards]: FlashcardsEditor,
} as const;

export default supportedEditors;

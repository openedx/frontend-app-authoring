import PdfEditor from '@src/editors/containers/PdfEditor';
import React from 'react';
import TextEditor from './containers/TextEditor';
import VideoEditor from './containers/VideoEditor';
import ProblemEditor from './containers/ProblemEditor';
import VideoUploadEditor from './containers/VideoUploadEditor';
import GameEditor from './containers/GameEditor';

// ADDED_EDITOR_IMPORTS GO HERE

import { blockTypes } from './data/constants/app';
import type { EditorComponent } from './EditorComponent';

// Note: `invideoquiz` has no entry here, and deliberately so: unlike the
// editors below, it has no in-tree fallback at all. Its editor ships
// out-of-tree, as a plugin registered against the `XBlockEditorSlot` (see
// plugins/xblock-invideoquiz-editor and src/plugin-slots/XBlockEditorSlot).
// Until a host deployment registers that plugin (e.g. via a pluginSlots
// entry in its env.config), invideoquiz falls back to the generic
// AdvancedEditor here, and to the legacy edit modal from the unit page -
// registering the plugin is a prerequisite for the dedicated form editor to
// be reachable at all, by design of the out-of-tree approach.
const supportedEditors: Record<string, React.ComponentType<EditorComponent>> = {
  [blockTypes.html]: TextEditor,
  [blockTypes.video]: VideoEditor,
  [blockTypes.problem]: ProblemEditor,
  [blockTypes.video_upload]: VideoUploadEditor,
  [blockTypes.pdf]: PdfEditor,
  // ADDED_EDITORS GO BELOW
  [blockTypes.game]: GameEditor,
};

export default supportedEditors;

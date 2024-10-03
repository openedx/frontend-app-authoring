import { createSelector } from 'reselect';
import type { EditorState } from '..';
import { blockTypes } from '../../constants/app';
import { isLibraryV1Key } from '../../../../generic/key-utils';
import * as urls from '../../services/cms/urls';

export const appSelector = (state: EditorState) => state.app;

const mkSimpleSelector = <T>(cb: (appState: EditorState['app']) => T) => createSelector([appSelector], cb);

// top-level app data selectors
export const simpleSelectors = {
  blockContent: mkSimpleSelector(app => app.blockContent),
  blockId: mkSimpleSelector(app => app.blockId),
  blockType: mkSimpleSelector(app => app.blockType),
  blockValue: mkSimpleSelector(app => app.blockValue),
  studioView: mkSimpleSelector(app => app.studioView),
  /** @deprecated Get as `const { learningContextid } = useEditorContext()` instead */
  learningContextId: mkSimpleSelector(app => app.learningContextId),
  editorInitialized: mkSimpleSelector(app => app.editorInitialized),
  saveResponse: mkSimpleSelector(app => app.saveResponse),
  lmsEndpointUrl: mkSimpleSelector(app => app.lmsEndpointUrl),
  studioEndpointUrl: mkSimpleSelector(app => app.studioEndpointUrl),
  unitUrl: mkSimpleSelector(app => app.unitUrl),
  blockTitle: mkSimpleSelector(app => app.blockTitle),
  images: mkSimpleSelector(app => app.images),
  videos: mkSimpleSelector(app => app.videos),
  showRawEditor: mkSimpleSelector(app => app.showRawEditor),
};

export const returnUrl = createSelector(
  [simpleSelectors.unitUrl, simpleSelectors.studioEndpointUrl, simpleSelectors.learningContextId,
    simpleSelectors.blockId],
  (unitUrl, studioEndpointUrl, learningContextId, blockId) => (
    urls.returnUrl({
      studioEndpointUrl, unitUrl, learningContextId, blockId,
    })
  ),
);

export const isLibrary = createSelector(
  [
    simpleSelectors.learningContextId,
    simpleSelectors.blockId,
  ],
  (learningContextId, blockId) => {
    if (isLibraryV1Key(learningContextId)) {
      return true;
    }
    if (blockId && blockId.startsWith('lb:')) {
      return true;
    }
    return false;
  },
);

export const isInitialized = createSelector(
  [
    simpleSelectors.unitUrl,
    simpleSelectors.blockValue,
    isLibrary,
  ],
  (unitUrl, blockValue, isLibraryBlock) => {
    if (isLibraryBlock) {
      return !!blockValue;
    }

    return !!blockValue && !!unitUrl;
  },
);

export const displayTitle = createSelector(
  [
    simpleSelectors.blockType,
    simpleSelectors.blockTitle,
  ],
  (blockType, blockTitle) => {
    if (blockType === null) {
      return null;
    }
    if (blockTitle !== null) {
      return blockTitle;
    }
    return (blockType === blockTypes.html)
      ? 'Text'
      : blockType[0].toUpperCase() + blockType.substring(1);
  },
);

export const analytics = createSelector(
  [
    simpleSelectors.blockId,
    simpleSelectors.blockType,
    simpleSelectors.learningContextId,
  ],
  (blockId, blockType, learningContextId) => (
    { blockId, blockType, learningContextId }
  ),
);

export default {
  ...simpleSelectors,
  isInitialized,
  returnUrl,
  displayTitle,
  analytics,
  isLibrary,
};

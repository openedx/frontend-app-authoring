import { createSelector } from 'reselect';
import { blockTypes } from '../../constants/app';
import { isLibraryV1Key } from '../../../../generic/key-utils';
import * as urls from '../../services/cms/urls';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './selectors';

export const appSelector = (state) => state.app;

const mkSimpleSelector = (cb) => createSelector([module.appSelector], cb);

// top-level app data selectors
export const simpleSelectors = {
  blockContent: mkSimpleSelector(app => app.blockContent),
  blockId: mkSimpleSelector(app => app.blockId),
  blockType: mkSimpleSelector(app => app.blockType),
  blockValue: mkSimpleSelector(app => app.blockValue),
  studioView: mkSimpleSelector(app => app.studioView),
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
  [module.simpleSelectors.unitUrl, module.simpleSelectors.studioEndpointUrl, module.simpleSelectors.learningContextId,
    module.simpleSelectors.blockId],
  (unitUrl, studioEndpointUrl, learningContextId, blockId) => (
    urls.returnUrl({
      studioEndpointUrl, unitUrl, learningContextId, blockId,
    })
  ),
);

export const isLibrary = createSelector(
  [
    module.simpleSelectors.learningContextId,
    module.simpleSelectors.blockId,
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
    module.simpleSelectors.unitUrl,
    module.simpleSelectors.blockValue,
    module.isLibrary,
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
    module.simpleSelectors.blockType,
    module.simpleSelectors.blockTitle,
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
    module.simpleSelectors.blockId,
    module.simpleSelectors.blockType,
    module.simpleSelectors.learningContextId,
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

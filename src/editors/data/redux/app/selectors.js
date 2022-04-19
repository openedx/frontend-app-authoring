import { createSelector } from 'reselect';

import { blockTypes } from '../../constants/app';
import * as urls from '../../services/cms/urls';
import * as module from './selectors';

export const appSelector = (state) => state.app;

const mkSimpleSelector = (cb) => createSelector([module.appSelector], cb);

// top-level app data selectors
export const simpleSelectors = {
  blockContent: mkSimpleSelector(app => app.blockContent),
  blockId: mkSimpleSelector(app => app.blockId),
  blockType: mkSimpleSelector(app => app.blockType),
  blockValue: mkSimpleSelector(app => app.blockValue),
  courseId: mkSimpleSelector(app => app.courseId),
  editorInitialized: mkSimpleSelector(app => app.editorInitialized),
  saveResponse: mkSimpleSelector(app => app.saveResponse),
  lmsEndpointUrl: mkSimpleSelector(app => app.lmsEndpointUrl),
  studioEndpointUrl: mkSimpleSelector(app => app.studioEndpointUrl),
  unitUrl: mkSimpleSelector(app => app.unitUrl),
  blockTitle: mkSimpleSelector(app => app.blockTitle),
};

export const returnUrl = createSelector(
  [module.simpleSelectors.unitUrl, module.simpleSelectors.studioEndpointUrl],
  (unitUrl, studioEndpointUrl) => (unitUrl ? urls.unit({ studioEndpointUrl, unitUrl }) : ''),
);

export const isInitialized = createSelector(
  [
    module.simpleSelectors.unitUrl,
    module.simpleSelectors.blockValue,
  ],
  (unitUrl, blockValue) => !!(unitUrl && blockValue),
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
    module.simpleSelectors.courseId,
  ],
  (blockId, blockType, courseId) => (
    { blockId, blockType, courseId }
  ),
);

export default {
  ...simpleSelectors,
  isInitialized,
  returnUrl,
  displayTitle,
  analytics,
};

// @ts-check
import React from 'react';

/** @typedef {import("../data/types.mjs").TagsInTaxonomy} TagsInTaxonomy */
/** @typedef {import("../data/types.mjs").StagedTagData} StagedTagData */

/* istanbul ignore next */
export const ContentTagsDrawerContext = React.createContext({
  stagedContentTags: /** @type{Record<number, StagedTagData[]>} */ ({}),
  globalStagedContentTags: /** @type{Record<number, StagedTagData[]>} */ ({}),
  globalStagedRemovedContentTags: /** @type{Record<number, string>} */ ({}),
  addStagedContentTag: /** @type{(taxonomyId: number, addedTag: StagedTagData) => void} */ (() => {}),
  removeStagedContentTag: /** @type{(taxonomyId: number, tagValue: string) => void} */ (() => {}),
  removeGlobalStagedContentTag: /** @type{(taxonomyId: number, tagValue: string) => void} */ (() => {}),
  addRemovedContentTag: /** @type{(taxonomyId: number, tagValue: string) => void} */ (() => {}),
  deleteRemovedContentTag: /** @type{(taxonomyId: number, tagValue: string) => void} */ (() => {}),
  setStagedTags: /** @type{(taxonomyId: number, tagsList: StagedTagData[]) => void} */ (() => {}),
  setGlobalStagedContentTags: /** @type{Function} */ (() => {}),
  commitGlobalStagedTags: /** @type{() => void} */ (() => {}),
  commitGlobalStagedTagsStatus: /** @type{null|string} */ (null),
  isContentDataLoaded: /** @type{boolean} */ (false),
  isContentTaxonomyTagsLoaded: /** @type{boolean} */ (false),
  isTaxonomyListLoaded: /** @type{boolean} */ (false),
  contentName: /** @type{string} */ (''),
  tagsByTaxonomy: /** @type{TagsInTaxonomy[]} */ ([]),
  isEditMode: /** @type{boolean} */ (false),
  toEditMode: /** @type{() => void} */ (() => {}),
  toReadMode: /** @type{() => void} */ (() => {}),
  collapsibleStates: /** @type{Record<number, boolean>} */ ({}),
  openCollapsible: /** @type{(taxonomyId: number) => void} */ (() => {}),
  closeCollapsible: /** @type{(taxonomyId: number) => void} */ (() => {}),
  toastMessage: /** @type{string|undefined} */ (undefined),
  showToastAfterSave: /** @type{() => void} */ (() => {}),
  closeToast: /** @type{() => void} */ (() => {}),
  setCollapsibleToInitalState: /** @type{() => void} */ (() => {}),
  otherTaxonomies: /** @type{TagsInTaxonomy[]} */ ([]),
});

// This context has not been added to ContentTagsDrawerContext because it has been
// created one level higher to control the behavior of the Sheet that contatins the Drawer.
// This logic is not used in legacy edx-platform screens. But it can be separated if we keep
// the contexts separate.
// TODO We can join both contexts when the Drawer is no longer used on edx-platform
/* istanbul ignore next */
export const ContentTagsDrawerSheetContext = React.createContext({
  blockingSheet: /** @type{boolean} */ (false),
  setBlockingSheet: /** @type{Function} */ (() => {}),
});

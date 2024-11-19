import React from 'react';

import type { TagsInTaxonomy, StagedTagData } from '../data/types';

export interface ContentTagsDrawerContextData {
  stagedContentTags: Record<number, StagedTagData[]>;
  globalStagedContentTags: Record<number, StagedTagData[]>;
  globalStagedRemovedContentTags: Record<number, string>;
  addStagedContentTag: (taxonomyId: number, addedTag: StagedTagData) => void;
  removeStagedContentTag: (taxonomyId: number, tagValue: string) => void;
  removeGlobalStagedContentTag: (taxonomyId: number, tagValue: string) => void;
  addRemovedContentTag: (taxonomyId: number, tagValue: string) => void;
  deleteRemovedContentTag: (taxonomyId: number, tagValue: string) => void;
  setStagedTags: (taxonomyId: number, tagsList: StagedTagData[]) => void;
  setGlobalStagedContentTags: Function;
  commitGlobalStagedTags: () => void;
  commitGlobalStagedTagsStatus: null | string;
  isContentDataLoaded: boolean;
  isContentTaxonomyTagsLoaded: boolean;
  isTaxonomyListLoaded: boolean;
  contentName: string;
  tagsByTaxonomy: TagsInTaxonomy[];
  isEditMode: boolean;
  toEditMode: () => void;
  toReadMode: () => void;
  collapsibleStates: Record<number, boolean>;
  openCollapsible: (taxonomyId: number) => void;
  closeCollapsible: (taxonomyId: number) => void;
  toastMessage: string | undefined;
  showToastAfterSave: () => void;
  closeToast: () => void;
  setCollapsibleToInitalState: () => void;
  otherTaxonomies: TagsInTaxonomy[];
}

/* istanbul ignore next */
export const ContentTagsDrawerContext = React.createContext<ContentTagsDrawerContextData>({
  stagedContentTags: {},
  globalStagedContentTags: {},
  globalStagedRemovedContentTags: {},
  addStagedContentTag: () => {},
  removeStagedContentTag: () => {},
  removeGlobalStagedContentTag: () => {},
  addRemovedContentTag: () => {},
  deleteRemovedContentTag: () => {},
  setStagedTags: () => {},
  setGlobalStagedContentTags: () => {},
  commitGlobalStagedTags: () => {},
  commitGlobalStagedTagsStatus: null,
  isContentDataLoaded: false,
  isContentTaxonomyTagsLoaded: false,
  isTaxonomyListLoaded: false,
  contentName: '',
  tagsByTaxonomy: [],
  isEditMode: false,
  toEditMode: () => {},
  toReadMode: () => {},
  collapsibleStates: {},
  openCollapsible: () => {},
  closeCollapsible: () => {},
  toastMessage: undefined,
  showToastAfterSave: () => {},
  closeToast: () => {},
  setCollapsibleToInitalState: () => {},
  otherTaxonomies: [],
});

// This context has not been added to ContentTagsDrawerContext because it has been
// created one level higher to control the behavior of the Sheet that contatins the Drawer.
// This logic is not used in legacy edx-platform screens. But it can be separated if we keep
// the contexts separate.
// TODO We can join both contexts when the Drawer is no longer used on edx-platform
/* istanbul ignore next */
export const ContentTagsDrawerSheetContext = React.createContext({
  blockingSheet: false,
  setBlockingSheet: (() => {}) as (blockingSheet: boolean) => void,
});

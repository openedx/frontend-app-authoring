// @ts-check
import React from 'react';
import { useCheckboxSetValues } from '@openedx/paragon';
import { cloneDeep } from 'lodash';

import { useContentTaxonomyTagsUpdater } from './data/apiHooks';
import { ContentTagsDrawerContext } from './common/context';

/** @typedef {import("../taxonomy/data/types.js").TaxonomyData} TaxonomyData */
/** @typedef {import("./data/types.js").Tag} ContentTagData */
/** @typedef {import("./ContentTagsCollapsible").TagTreeEntry} TagTreeEntry */
/** @typedef {import("./data/types.js").StagedTagData} StagedTagData */
/** @typedef {import("./data/types.js").UpdateTagsData} UpdateTagsData */

/**
 * Util function that sorts the keys of a tree in alphabetical order.
 *
 * @param {object} tree - tree that needs it's keys sorted
 * @returns {object} sorted tree
 */
const sortKeysAlphabetically = (tree) => {
  const sortedObj = {};
  Object.keys(tree)
    .sort()
    .forEach((key) => {
      sortedObj[key] = tree[key];
      if (tree[key] && typeof tree[key] === 'object') {
        sortedObj[key].children = sortKeysAlphabetically(tree[key].children);
      }
    });
  return sortedObj;
};

/**
 * Util function that returns the leafs of a tree. Mainly used to extract the explicit
 * tags selected in the staged tags tree
 *
 * @param {object} tree - tree to extract the leaf tags from
 * @returns {StagedTagData[]} array of leaf (explicit) tags of provided tree
 */
const getLeafTags = (tree) => {
  const leafTags = [];

  function traverse(node) {
    Object.keys(node).forEach(key => {
      const child = node[key];
      if (Object.keys(child.children).length === 0) {
        leafTags.push({
          value: key,
          // Always true because this is a new added tag,
          // so the user can delete.
          canDeleteObjecttag: true,
          lineage: child.lineage,
        });
      } else {
        traverse(child.children);
      }
    });
  }

  traverse(tree);
  return leafTags;
};

/**
 * Handles all the underlying logic for the ContentTagsCollapsible component
 * @param {string} contentId The ID of the content we're tagging (e.g. usage key)
 * @param {StagedTagData[]} stagedContentTags
 *       - Array of staged tags represented as objects with value/label
 * @param {TaxonomyData & {contentTags: ContentTagData[]}} taxonomyAndTagsData
 * @returns {{
 *      tagChangeHandler: (tagSelectableBoxValue: string, checked: boolean) => void,
 *      removeAppliedTagHandler: (tagSelectableBoxValue: string) => void,
 *      appliedContentTagsTree: Record<string, TagTreeEntry>,
 *      stagedContentTagsTree: Record<string, TagTreeEntry>,
 *      contentTagsCount: number,
 *      checkedTags: any,
 *      commitStagedTagsToGlobal: () => void,
 *      updateTags: import('@tanstack/react-query').UseMutationResult<
 *                  any, unknown, { tagsData: Promise<UpdateTagsData[]>; }, unknown
 *      >
 * }}
 */
const useContentTagsCollapsibleHelper = (
  contentId,
  stagedContentTags,
  taxonomyAndTagsData,
) => {
  const {
    isEditMode,
    addStagedContentTag,
    removeStagedContentTag,
    removeGlobalStagedContentTag,
    addRemovedContentTag,
    deleteRemovedContentTag,
    globalStagedContentTags,
    setGlobalStagedContentTags,
    globalStagedRemovedContentTags,
  } = React.useContext(ContentTagsDrawerContext);

  const {
    id, contentTags,
  } = taxonomyAndTagsData;
  const updateTags = useContentTaxonomyTagsUpdater(contentId);

  // Keeps track of the content objects tags count (both implicit and explicit)
  const [contentTagsCount, setContentTagsCount] = React.useState(0);

  // Keeps track of the tree structure for tags that are add by selecting/unselecting
  // tags in the dropdowns.
  const [stagedContentTagsTree, setStagedContentTagsTree] = React.useState({});

  // To handle checking/unchecking tags in the SelectableBox
  const [checkedTags, { add, remove, clear }] = useCheckboxSetValues();

  // State to keep track of the staged tags (and along with ancestors) that should be removed
  const [stagedTagsToRemove, setStagedTagsToRemove] = React.useState(/** @type string[] */([]));

  // State to keep track of the global tags (staged and fetched) that should be removed
  const [globalTagsToRemove, setGlobalTagsToRemove] = React.useState(/** @type string[] */([]));

  // Handles the removal of staged content tags based on what was removed
  // from the staged tags tree. We are doing it in a useEffect since the removeTag
  // method is being called inside a setState of the parent component, which
  // was causing warnings
  React.useEffect(() => {
    stagedTagsToRemove.forEach(tag => removeStagedContentTag(id, tag));
  }, [stagedTagsToRemove, removeStagedContentTag, id]);

  // When you change the drawer mode, it is necessary to clear
  // all checked tags in the select.
  React.useEffect(() => {
    clear();
  }, [isEditMode]);

  React.useEffect(() => {
    globalTagsToRemove.forEach((tag) => {
      if (globalStagedContentTags[id]
          && globalStagedContentTags[id].some(t => t.value === tag)) {
        // A new tag has been removed
        removeGlobalStagedContentTag(id, tag);
      } else if (contentTags.some(t => t.value === tag)) {
        // A fetched tag has been removed
        addRemovedContentTag(id, tag);
      }
    });
  }, [globalTagsToRemove, removeGlobalStagedContentTag, id]);

  // Handles making requests to the update endpoint when the staged tags need to be committed
  const commitStagedTagsToGlobal = React.useCallback(() => {
    // Filter out only leaf nodes of staging tree to commit
    const explicitStaged = getLeafTags(stagedContentTagsTree);

    const globalTags = cloneDeep(globalStagedContentTags);
    const newGlobalTags = [];

    explicitStaged.forEach((tag) => {
      if (globalStagedRemovedContentTags[id]
          && globalStagedRemovedContentTags[id].includes(tag.value)) {
        // A fetched tag that has been removed has been added again
        deleteRemovedContentTag(id, tag.value);
      } else {
        // New tag added
        newGlobalTags.push(tag);
      }
    });

    if (newGlobalTags) {
      if (!globalTags[id]) {
        globalTags[id] = newGlobalTags;
      } else {
        // Filter out applied tags that should become implicit because a child tag was committed
        const stagedLineages = stagedContentTags.map(st => decodeURIComponent(st.value).split(',').slice(0, -1)).flat();
        const applied = globalTags[id].filter(t => !stagedLineages.includes(t.value));

        globalTags[id] = [...applied, ...newGlobalTags];
      }

      setGlobalStagedContentTags(globalTags);
    }
  }, [contentTags, stagedContentTags, stagedContentTagsTree, updateTags]);

  // This converts the contentTags prop to the tree structure mentioned above
  const appliedContentTagsTree = React.useMemo(() => {
    let contentTagsCounter = 0;

    // When an error occurs while updating, the contentTags query is invalidated,
    // hence they will be recalculated, and the updateTags mutation should be reset.
    if (updateTags.isError) {
      updateTags.reset();
    }

    const resultTree = {};
    contentTags.forEach(item => {
      let currentLevel = resultTree;

      item.lineage.forEach((key, index) => {
        if (!currentLevel[key]) {
          const isExplicit = index === item.lineage.length - 1;
          currentLevel[key] = {
            explicit: isExplicit,
            children: {},
            canChangeObjecttag: item.canChangeObjecttag,
            canDeleteObjecttag: item.canDeleteObjecttag,
          };

          // Populating the SelectableBox with "selected" (explicit) tags
          const value = item.lineage.map(l => encodeURIComponent(l)).join(',');
          // Clear all the existing applied tags
          remove(value);
          // Add only the explicitly applied tags
          if (isExplicit) {
            add(value);
          }
          contentTagsCounter += 1;
        }

        currentLevel = currentLevel[key].children;
      });
    });

    setContentTagsCount(contentTagsCounter);
    return resultTree;
  }, [contentTags, updateTags.isError]);

  /**
   * Util function that removes the tag along with its ancestors if it was
   * the only explicit child tag. It returns a list of staged tags (and ancestors) that
   * were unstaged and should be removed
   *
   * @param {object} tree - tag tree to remove the tag from
   * @param {string[]} tagsToRemove - remaining lineage of tag to remove at each recursive level.
   *                                  eg: ['grand parent', 'parent', 'tag']
   * @param {boolean} staged - whether we are removing staged tags or not
   * @param {string[]} fullLineage - Full lineage of tag being removed
   * @returns {string[]} array of staged tag values (with ancestors) that should be removed from staged tree
   *
   */
  const removeTags = React.useCallback((tree, tagsToRemove, staged, fullLineage) => {
    const removedTags = [];

    const traverseAndRemoveTags = (subTree, innerTagsToRemove) => {
      if (!subTree || !innerTagsToRemove.length) {
        return;
      }
      const key = innerTagsToRemove[0];
      if (subTree[key]) {
        traverseAndRemoveTags(subTree[key].children, innerTagsToRemove.slice(1));

        if (
          Object.keys(subTree[key].children).length === 0
          && (subTree[key].explicit === false || innerTagsToRemove.length === 1)
        ) {
          // eslint-disable-next-line no-param-reassign
          delete subTree[key];

          // Remove tags (including ancestors) from staged tags select menu
          if (staged) {
            // Build value from lineage by traversing beginning till key, then encoding them
            const toRemove = fullLineage.slice(0, fullLineage.indexOf(key) + 1).map(item => encodeURIComponent(item));
            if (toRemove.length > 0) {
              removedTags.push(toRemove.join(','));
            }
          }
        }
      }
    };

    traverseAndRemoveTags(tree, tagsToRemove);

    return removedTags;
  }, []);

  // Add tag to the tree, and while traversing remove any selected ancestor tags
  // as they should become implicit
  const addTags = (tree, tagLineage, selectedTag) => {
    const value = [];
    let traversal = tree;
    tagLineage.forEach(tag => {
      const isExplicit = selectedTag === tag;

      // Clear out the ancestor tags leading to newly selected tag
      // as they automatically become implicit
      value.push(encodeURIComponent(tag));

      if (!traversal[tag]) {
        traversal[tag] = {
          explicit: isExplicit,
          children: {},
          canChangeObjecttag: false,
          canDeleteObjecttag: false,
        };
        if (isExplicit) {
          traversal[tag].lineage = tagLineage;
        }
      } /* istanbul ignore next */ else {
        traversal[tag].explicit = isExplicit;
        traversal[tag].lineage = tagLineage;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      isExplicit ? add(value.join(',')) : remove(value.join(','));
      traversal = traversal[tag].children;
    });
  };

  const tagChangeHandler = React.useCallback((tagSelectableBoxValue, checked) => {
    const tagLineage = tagSelectableBoxValue.split(',').map(t => decodeURIComponent(t));
    const selectedTag = tagLineage.slice(-1)[0];

    if (checked) {
      const stagedTree = cloneDeep(stagedContentTagsTree);
      // We "add" the tag to the SelectableBox.Set inside the addTags method
      addTags(stagedTree, tagLineage, selectedTag);

      // Update the staged content tags tree
      setStagedContentTagsTree(stagedTree);

      // Add content tag to taxonomy's staged tags select menu
      addStagedContentTag(
        id,
        {
          value: tagSelectableBoxValue,
          label: selectedTag,
        },
      );
    } else {
      // Remove tag from the SelectableBox.Set
      remove(tagSelectableBoxValue);

      // Remove tag along with it's from ancestors if it's the only child tag
      // from the staged tags tree and update the staged content tags tree
      setStagedContentTagsTree(prevStagedContentTagsTree => {
        const updatedStagedContentTagsTree = cloneDeep(prevStagedContentTagsTree);
        const tagsToRemove = removeTags(updatedStagedContentTagsTree, tagLineage, true, tagLineage);
        setStagedTagsToRemove(tagsToRemove);
        return updatedStagedContentTagsTree;
      });
    }
  }, [
    stagedContentTagsTree, setStagedContentTagsTree, addTags, removeTags,
    id, addStagedContentTag, removeStagedContentTag,
  ]);

  const removeAppliedTagHandler = React.useCallback((tagSelectableBoxValue) => {
    const tagLineage = tagSelectableBoxValue.split(',').map(t => decodeURIComponent(t));

    // Remove tag from the SelectableBox.Set
    remove(tagSelectableBoxValue);

    // Remove tags from applied tags
    removeTags(appliedContentTagsTree, tagLineage, false, tagLineage);
    const selectedTag = tagLineage.slice(-1)[0];

    setGlobalTagsToRemove([selectedTag]);
  }, [appliedContentTagsTree, id, removeStagedContentTag]);

  return {
    tagChangeHandler,
    removeAppliedTagHandler,
    appliedContentTagsTree: sortKeysAlphabetically(appliedContentTagsTree),
    stagedContentTagsTree: sortKeysAlphabetically(stagedContentTagsTree),
    contentTagsCount,
    checkedTags,
    commitStagedTagsToGlobal,
    updateTags,
  };
};

export default useContentTagsCollapsibleHelper;

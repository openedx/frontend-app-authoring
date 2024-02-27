// @ts-check
import React from 'react';
import { useCheckboxSetValues } from '@openedx/paragon';
import { cloneDeep } from 'lodash';

import { useContentTaxonomyTagsUpdater } from './data/apiHooks';

/**
 * Util function that sorts the keys of a tree in alphabetical order.
 *
 * @param {object} tree - tree that needs it's keys sorted
 * @returns {object} merged tree containing both tree1 and tree2
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
 * Util function that consolidates two tag trees into one, sorting the keys in
 * alphabetical order.
 *
 * @param {object} tree1 - first tag tree
 * @param {object} tree2 - second tag tree
 * @returns {object} merged tree containing both tree1 and tree2
 */
const mergeTrees = (tree1, tree2) => {
  const mergedTree = cloneDeep(tree1);

  const mergeRecursively = (destination, source) => {
    Object.entries(source).forEach(([key, sourceValue]) => {
      const destinationValue = destination[key];

      if (destinationValue && sourceValue && typeof destinationValue === 'object' && typeof sourceValue === 'object') {
        mergeRecursively(destinationValue, sourceValue);
      } else {
        // eslint-disable-next-line no-param-reassign
        destination[key] = cloneDeep(sourceValue);
      }
    });
  };

  mergeRecursively(mergedTree, tree2);
  return sortKeysAlphabetically(mergedTree);
};

/**
 * Util function that removes the tag along with its ancestors if it was
 * the only explicit child tag.
 *
 * @param {object} tree - tag tree to remove the tag from
 * @param {string[]} tagsToRemove - full lineage of tag to remove.
 *                                  eg: ['grand parent', 'parent', 'tag']
 */
const removeTags = (tree, tagsToRemove) => {
  if (!tree || !tagsToRemove.length) {
    return;
  }
  const key = tagsToRemove[0];
  if (tree[key]) {
    removeTags(tree[key].children, tagsToRemove.slice(1));

    if (Object.keys(tree[key].children).length === 0 && (tree[key].explicit === false || tagsToRemove.length === 1)) {
      // eslint-disable-next-line no-param-reassign
      delete tree[key];
    }
  }
};

/*
 * Handles all the underlying logic for the ContentTagsCollapsible component
 */
const useContentTagsCollapsibleHelper = (
  contentId,
  taxonomyAndTagsData,
  addStagedContentTag,
  removeStagedContentTag,
) => {
  const {
    id, contentTags, canTagObject,
  } = taxonomyAndTagsData;
  // State to determine whether the tags are being updating so we can make a call
  // to the update endpoint to the reflect those changes
  const [updatingTags, setUpdatingTags] = React.useState(false);
  const updateTags = useContentTaxonomyTagsUpdater(contentId, id);

  // Keeps track of the content objects tags count (both implicit and explicit)
  const [contentTagsCount, setContentTagsCount] = React.useState(0);

  // Keeps track of the tree structure for tags that are add by selecting/unselecting
  // tags in the dropdowns.
  const [stagedContentTagsTree, setStagedContentTagsTree] = React.useState({});

  // To handle checking/unchecking tags in the SelectableBox
  const [checkedTags, { add, remove, clear }] = useCheckboxSetValues();

  // =================================================================

  // TODO: Properly implement this based on feature/requirements

  // // Handles making requests to the update endpoint whenever the checked tags change
  // React.useEffect(() => {
  //   // We have this check because this hook is fired when the component first loads
  //   // and reloads (on refocus). We only want to make a request to the update endpoint when
  //   // the user is updating the tags.
  //   if (updatingTags) {
  //     setUpdatingTags(false);
  //     const tags = checkedTags.map(t => decodeURIComponent(t.split(',').slice(-1)));
  //     updateTags.mutate({ tags });
  //   }
  // }, [contentId, id, canTagObject, checkedTags]);

  // ==================================================================

  // This converts the contentTags prop to the tree structure mentioned above
  const appliedContentTagsTree = React.useMemo(() => {
    let contentTagsCounter = 0;

    // Clear all the tags that have not been commited and the checked boxes when
    // fresh contentTags passed in so the latest state from the backend is rendered
    setStagedContentTagsTree({});
    clear();

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
          // eslint-disable-next-line no-unused-expressions
          isExplicit ? add(value) : remove(value);
          contentTagsCounter += 1;
        }

        currentLevel = currentLevel[key].children;
      });
    });

    setContentTagsCount(contentTagsCounter);
    return resultTree;
  }, [contentTags, updateTags.isError]);

  // Add tag to the tree, and while traversing remove any selected ancestor tags
  // as they should become implicit
  const addTags = (tree, tagLineage, selectedTag) => {
    const value = [];
    let traversal = tree;
    tagLineage.forEach(tag => {
      const isExplicit = selectedTag === tag;

      if (!traversal[tag]) {
        traversal[tag] = {
          explicit: isExplicit,
          children: {},
          canChangeObjecttag: false,
          canDeleteObjecttag: false,
        };
      } else {
        traversal[tag].explicit = isExplicit;
      }

      // Clear out the ancestor tags leading to newly selected tag
      // as they automatically become implicit
      value.push(encodeURIComponent(tag));

      if (isExplicit) {
        add(value.join(','));
      } else {
        removeStagedContentTag(id, value.join(','));
        remove(value.join(','));
      }

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
        removeTags(updatedStagedContentTagsTree, tagLineage);
        return updatedStagedContentTagsTree;
      });

      // Remove content tag from taxonomy's staged tags select menu
      removeStagedContentTag(id, tagSelectableBoxValue);
    }

    // setUpdatingTags(true);
  }, [
    stagedContentTagsTree, setStagedContentTagsTree, addTags, removeTags, removeTags,
    id, addStagedContentTag, removeStagedContentTag,
  ]);

  return {
    tagChangeHandler,
    appliedContentTagsTree: sortKeysAlphabetically(appliedContentTagsTree),
    stagedContentTagsTree: sortKeysAlphabetically(stagedContentTagsTree),
    contentTagsCount,
    checkedTags,
  };
};

export default useContentTagsCollapsibleHelper;

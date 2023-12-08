import React from 'react';
import { useCheckboxSetValues } from '@edx/paragon';
import { cloneDeep } from 'lodash';

import { useContentTaxonomyTagsUpdater } from './data/apiHooks';

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

  const sortKeysAlphabetically = (obj) => {
    const sortedObj = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sortedObj[key] = obj[key];
        if (obj[key] && typeof obj[key] === 'object') {
          sortedObj[key].children = sortKeysAlphabetically(obj[key].children);
        }
      });
    return sortedObj;
  };

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
const useContentTagsCollapsibleHelper = (contentId, taxonomyAndTagsData) => {
  const {
    id, contentTags,
  } = taxonomyAndTagsData;
  // State to determine whether the tags are being updating so we can make a call
  // to the update endpoint to the reflect those changes
  const [updatingTags, setUpdatingTags] = React.useState(false);
  const updateTags = useContentTaxonomyTagsUpdater(contentId, id);

  // Keeps track of the content objects tags count (both implicit and explicit)
  const [contentTagsCount, setContentTagsCount] = React.useState(0);

  // Keeps track of the tree structure for tags that are add by selecting/unselecting
  // tags in the dropdowns.
  const [addedContentTags, setAddedContentTags] = React.useState({});

  // To handle checking/unchecking tags in the SelectableBox
  const [checkedTags, { add, remove, clear }] = useCheckboxSetValues();

  // Handles making requests to the update endpoint whenever the checked tags change
  React.useEffect(() => {
    // We have this check because this hook is fired when the component first loads
    // and reloads (on refocus). We only want to make a request to the update endpoint when
    // the user is updating the tags.
    if (updatingTags) {
      setUpdatingTags(false);
      const tags = checkedTags.map(t => decodeURIComponent(t.split(',').slice(-1)));
      updateTags.mutate({ tags });
    }
  }, [contentId, id, checkedTags]);

  // This converts the contentTags prop to the tree structure mentioned above
  const appliedContentTags = React.useMemo(() => {
    let contentTagsCounter = 0;

    // Clear all the tags that have not been commited and the checked boxes when
    // fresh contentTags passed in so the latest state from the backend is rendered
    setAddedContentTags({});
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

  // This is the source of truth that represents the current state of tags in
  // this Taxonomy as a tree. Whenever either the `appliedContentTags` (i.e. tags passed in
  // the prop from the backed) change, or when the `addedContentTags` (i.e. tags added by
  // selecting/unselecting them in the dropdown) change, the tree is recomputed.
  const tagsTree = React.useMemo(() => (
    mergeTrees(appliedContentTags, addedContentTags)
  ), [appliedContentTags, addedContentTags]);

  // Add tag to the tree, and while traversing remove any selected ancestor tags
  // as they should become implicit
  const addTags = (tree, tagLineage, selectedTag) => {
    const value = [];
    let traversal = tree;
    tagLineage.forEach(tag => {
      const isExplicit = selectedTag === tag;

      if (!traversal[tag]) {
        traversal[tag] = { explicit: isExplicit, children: {} };
      } else {
        traversal[tag].explicit = isExplicit;
      }

      // Clear out the ancestor tags leading to newly selected tag
      // as they automatically become implicit
      value.push(encodeURIComponent(tag));
      // eslint-disable-next-line no-unused-expressions
      isExplicit ? add(value.join(',')) : remove(value.join(','));

      traversal = traversal[tag].children;
    });
  };

  const tagChangeHandler = React.useCallback((tagSelectableBoxValue, checked) => {
    const tagLineage = tagSelectableBoxValue.split(',').map(t => decodeURIComponent(t));
    const selectedTag = tagLineage.slice(-1)[0];

    const addedTree = { ...addedContentTags };
    if (checked) {
      // We "add" the tag to the SelectableBox.Set inside the addTags method
      addTags(addedTree, tagLineage, selectedTag);
    } else {
      // Remove tag from the SelectableBox.Set
      remove(tagSelectableBoxValue);

      // We remove them from both incase we are unselecting from an
      // existing applied Tag or a newly added one
      removeTags(addedTree, tagLineage);
      removeTags(appliedContentTags, tagLineage);
    }

    setAddedContentTags(addedTree);
    setUpdatingTags(true);
  });

  return {
    tagChangeHandler, tagsTree, contentTagsCount, checkedTags,
  };
};

export default useContentTagsCollapsibleHelper;

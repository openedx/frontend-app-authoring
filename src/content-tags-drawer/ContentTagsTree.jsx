import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import TagBubble from './TagBubble';

/**
 * Component that renders Tags under a Taxonomy in the nested tree format
 * It constructs a tree structure consolidating the tag data. Example:
 *
 * FROM:
 *
 * [
 *   {
 *     "value": "DNA Sequencing",
 *     "lineage": [
 *       "Science and Research",
 *       "Genetics Subcategory",
 *       "DNA Sequencing"
 *     ]
 *   },
 *   {
 *     "value": "Virology",
 *     "lineage": [
 *       "Science and Research",
 *       "Molecular, Cellular, and Microbiology",
 *       "Virology"
 *     ]
 *   }
 * ]
 *
 * TO:
 *
 * {
 *   "Science and Research": {
 *     "Genetics Subcategory": {
 *       "DNA Sequencing": {}
 *     },
 *     "Molecular, Cellular, and Microbiology": {
 *       "Virology": {}
 *     }
 *   }
 * }
 *
 * @param {Object[]} appliedContentTags - Array of taxonomy tags that are applied to the content
 * @param {string} appliedContentTags.value - Value of applied Tag
 * @param {string} appliedContentTags.lineage - Array of Tag's ancestors sorted (ancestor -> tag)
 */
const ContentTagsTree = ({ appliedContentTags }) => {
  const tagsTree = useMemo(() => {
    const tree = {};
    appliedContentTags.forEach(tag => {
      tag.lineage.reduce((currentLevel, ancestor) => {
        // eslint-disable-next-line no-param-reassign
        currentLevel[ancestor] = currentLevel[ancestor] || {};
        return currentLevel[ancestor];
      }, tree);
    });
    return tree;
  }, [appliedContentTags]);

  const renderTagsTree = (tag, level) => Object.keys(tag).map((key) => {
    if (tag[key] !== undefined) {
      return (
        <div key={`tag-${key}-level-${level}`}>
          <TagBubble
            key={`tag-${key}`}
            value={key}
            implicit={Object.keys(tag[key]).length !== 0}
            level={level}
          />
          { renderTagsTree(tag[key], level + 1) }
        </div>
      );
    }
    return null;
  });

  return renderTagsTree(tagsTree, 0);
};

ContentTagsTree.propTypes = {
  appliedContentTags: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    lineage: PropTypes.arrayOf(PropTypes.string),
  })).isRequired,
};

export default ContentTagsTree;

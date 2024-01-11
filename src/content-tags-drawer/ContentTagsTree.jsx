// @ts-check
import React from 'react';
import PropTypes from 'prop-types';

import TagBubble from './TagBubble';

/**
 * Component that renders Tags under a Taxonomy in the nested tree format.
 *
 * Example:
 *
 * {
 *   "Science and Research": {
 *     explicit: false,
 *     children: {
 *       "Genetics Subcategory": {
 *         explicit: false,
 *         children: {
 *           "DNA Sequencing": {
 *             explicit: true,
 *             children: {}
 *           }
 *         }
 *       },
 *       "Molecular, Cellular, and Microbiology": {
 *         explicit: false,
 *         children: {
 *           "Virology": {
 *             explicit: true,
 *             children: {}
 *           }
 *         }
 *       }
 *     }
 *   }
 * };
 *
 * @param {Object} props - The component props.
 * @param {Object} props.tagsTree - Array of taxonomy tags that are applied to the content.
 * @param {(
 *   tagSelectableBoxValue: string,
 *   checked: boolean
 * ) => void} props.removeTagHandler - Function that is called when removing tags from the tree.
 */
const ContentTagsTree = ({ tagsTree, removeTagHandler }) => {
  const renderTagsTree = (tag, level, lineage) => Object.keys(tag).map((key) => {
    const updatedLineage = [...lineage, encodeURIComponent(key)];
    if (tag[key] !== undefined) {
      return (
        <div key={`tag-${key}-level-${level}`}>
          <TagBubble
            key={`tag-${key}`}
            value={key}
            implicit={!tag[key].explicit}
            level={level}
            lineage={updatedLineage}
            removeTagHandler={removeTagHandler}
            canDelete={tag[key].canDelete}
          />
          { renderTagsTree(tag[key].children, level + 1, updatedLineage) }
        </div>
      );
    }
    return null;
  });

  return <>{renderTagsTree(tagsTree, 0, [])}</>;
};

ContentTagsTree.propTypes = {
  tagsTree: PropTypes.objectOf(
    PropTypes.shape({
      explicit: PropTypes.bool.isRequired,
      children: PropTypes.shape({}).isRequired,
      canDelete: PropTypes.bool.isRequired,
    }).isRequired,
  ).isRequired,
  removeTagHandler: PropTypes.func.isRequired,
};

export default ContentTagsTree;

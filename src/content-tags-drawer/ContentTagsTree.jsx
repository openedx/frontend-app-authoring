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
 * @param {boolean} props.editable - Whether the tags appear with an 'x' allowing the user to remove them.
 */
const ContentTagsTree = ({ tagsTree, removeTagHandler, editable }) => {
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
            editable={editable}
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
    }).isRequired,
  ).isRequired,
  removeTagHandler: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
};

export default ContentTagsTree;

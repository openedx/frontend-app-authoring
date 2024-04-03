// @ts-check
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Stack, IconButton } from '@openedx/paragon';
import { Tag, Close } from '@openedx/paragon/icons';
import messages from './messages';
import { ContentTagsDrawerContext } from './common/context';

const TagComponent = ({
  value,
  canDelete,
  explicit,
  removeTagHandler,
  lineage,
}) => {
  const intl = useIntl();

  const handleClick = React.useCallback(() => {
    if (explicit && canDelete) {
      removeTagHandler(lineage.join(','));
    }
  }, [explicit, lineage, canDelete, removeTagHandler]);

  return (
    <Stack direction="horizontal">
      <Icon src={Tag} className="mr-1 pb-1.5 text-info-500" />
      {value}
      {explicit && canDelete && (
        <IconButton
          isActive
          key={value}
          src={Close}
          iconAs={Icon}
          alt={intl.formatMessage(messages.tagsDeleteAltText)}
          onClick={handleClick}
          variant="light"
          className="tags-tree-delete-button ml-2 text-gray-600"
        />
      )}
    </Stack>
  );
};

TagComponent.propTypes = {
  value: PropTypes.string.isRequired,
  canDelete: PropTypes.bool,
  explicit: PropTypes.bool,
  lineage: PropTypes.arrayOf(PropTypes.string).isRequired,
  removeTagHandler: PropTypes.func,
};

TagComponent.defaultProps = {
  removeTagHandler: undefined,
  canDelete: false,
  explicit: false,
};

/**
 * Component that renders Tags under a Taxonomy in the nested tree format.
 *
 * Example:
 *
 * {
 *   "Science and Research": {
 *     explicit: false,
 *     canDeleteObjecttag: true,
 *     children: {
 *       "Genetics Subcategory": {
 *         explicit: false,
 *         canDeleteObjecttag: true,
 *         children: {
 *           "DNA Sequencing": {
 *             explicit: true,
 *             canDeleteObjecttag: false,
 *             children: {}
 *           }
 *         }
 *       },
 *       "Molecular, Cellular, and Microbiology": {
 *         explicit: false,
 *         canDeleteObjecttag: false,
 *         children: {
 *           "Virology": {
 *             explicit: true,
 *             canDeleteObjecttag: true,
 *             children: {}
 *           }
 *         }
 *       }
 *     }
 *   }
 * };
 *
 * @param {Object} props - The component props.
 * @param {Object} props.tags - Array of taxonomy tags that are applied to the content.
 * @param {number} props.rootDepth - Depth of the parent tag (root), used to render tabs for the tree.
 * @param {string} props.parentKey - Key of the parent tag.
 * @param {string[]} props.lineage - Lineage of the tag.
 * @param {(
 *   tagSelectableBoxValue: string,
 *   checked: boolean
 * ) => void} props.removeTagHandler - Function that is called when removing tags from the tree.
 */
const TagsTree = ({
  tags,
  rootDepth,
  parentKey,
  lineage,
  removeTagHandler,
}) => {
  const { isEditMode } = useContext(ContentTagsDrawerContext);

  if (Object.keys(tags).length === 0) {
    return null;
  }

  // Used to Generate tabs for the parents of this tree
  const tabsNumberArray = Array.from({ length: rootDepth }, (_, index) => index + 1);

  return (
    <div className="tags-tree" key={parentKey}>
      {Object.keys(tags).map((key) => (
        <div className="mt-1.5 mb-1.5" key={key}>
          <div className="d-flex pl-2.5" key={key}>
            {
              tabsNumberArray.map((index) => <span className="d-inline-block ml-4" key={`${key}-${index}`} />)
            }
            <TagComponent
              value={key}
              canDelete={isEditMode && tags[key].canDeleteObjecttag}
              explicit={tags[key].explicit}
              lineage={[...lineage, encodeURIComponent(key)]}
              removeTagHandler={removeTagHandler}
            />
          </div>
          { tags[key].children
            && (
              <TagsTree
                tags={tags[key].children}
                rootDepth={rootDepth + 1}
                parentKey={key}
                lineage={[...lineage, encodeURIComponent(key)]}
                removeTagHandler={removeTagHandler}
              />
            )}
        </div>
      ))}
    </div>
  );
};

TagsTree.propTypes = {
  tags: PropTypes.shape({}).isRequired,
  parentKey: PropTypes.string,
  rootDepth: PropTypes.number,
  lineage: PropTypes.arrayOf(PropTypes.string),
  removeTagHandler: PropTypes.func,
};

TagsTree.defaultProps = {
  rootDepth: 0,
  parentKey: undefined,
  lineage: [],
  removeTagHandler: undefined,
};

export default TagsTree;

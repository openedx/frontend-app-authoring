import React, { useContext } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon, Stack, IconButton, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { Tag, Close, Lock } from '@openedx/paragon/icons';
import messages from './messages';
import { ContentTagsDrawerContext } from './common/context';

const LibraryLockIcon = ({ key }: { key: string }) => (
  <OverlayTrigger
    placement="top"
    overlay={(
      <Tooltip
        id={`tooltip-lock-${key}`}
      >
        <FormattedMessage {...messages.libraryLockIconTooltip} />
      </Tooltip>
    )}
  >
    <Icon
      src={Lock}
      size="xs"
      className="ml-1"
      data-testid="lock-icon"
    />
  </OverlayTrigger>
);

interface TagComponentProps {
  value: string;
  lineage: string[];
  canDelete: boolean;
  explicit: boolean;
  removeTagHandler?: (value: string) => void;
  afterComponent?: React.ReactNode;
}

const TagComponent = ({
  value,
  lineage,
  removeTagHandler,
  canDelete = false,
  explicit = false,
  afterComponent,
}: TagComponentProps) => {
  const intl = useIntl();

  const handleClick = React.useCallback(() => {
    if (explicit && canDelete && removeTagHandler) {
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
      {afterComponent}
    </Stack>
  );
};

interface TagsTreeProps {
  tags: Record<string, any>; // TODO: Define a type for Tags
  parentKey?: string;
  rootDepth?: number;
  lineage?: string[];
  removeTagHandler?: (value: string) => void;
  afterTagsComponent?: React.ReactNode;
}

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
 */
const TagsTree = ({
  /** Array of taxonomy tags that are applied to the content. */
  tags,
  /** Depth of the parent tag (root), used to render tabs for the tree. */
  rootDepth = 0,
  /** Key of the parent tag. */
  parentKey,
  /** Lineage of the tag. */
  lineage = [],
  /** Function that is called when removing tags from the tree. */
  removeTagHandler,
  /** Optional component to render after the tags components. */
  afterTagsComponent,
}: TagsTreeProps) => {
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
              afterComponent={isEditMode && tags[key].explicit && tags[key].isCopied && (
                // So far, `isCopied` is only used to check if the tag has been imported from a library.
                // If another function is added to `isCopied`, this may change.
                <LibraryLockIcon key={key} />
              )}
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
                afterTagsComponent={afterTagsComponent}
              />
            )}
        </div>
      ))}
    </div>
  );
};

export default TagsTree;

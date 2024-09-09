import React from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  Form,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  SearchField,
} from '@openedx/paragon';
import {
  ArrowDropDown,
  ArrowDropUp,
  Warning,
  Tag,
} from '@openedx/paragon/icons';
import SearchFilterWidget from './SearchFilterWidget';
import messages from './messages';
import { useSearchContext } from './SearchManager';
import { useTagFilterOptions } from './data/apiHooks';
import { LoadingSpinner } from '../generic/Loading';
import { TAG_SEP } from './data/api';

/**
 * A menu item with a checkbox and an optional ▼ button (to show/hide children)
 */
const TagMenuItem: React.FC<{
  label: string;
  tagPath: string;
  isChecked: boolean;
  onClickCheckbox: () => void;
  tagCount: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleChildren?: (tagPath: string) => void;
}> = ({
  label,
  tagPath,
  tagCount,
  isChecked,
  onClickCheckbox,
  hasChildren,
  isExpanded,
  onToggleChildren,
}) => {
  const intl = useIntl();
  const randomNumber = React.useMemo(() => Math.floor(Math.random() * 1000), []);
  const checkboxId = tagPath.replace(/[\W]/g, '_') + randomNumber;

  const expandChildrenClick = React.useCallback((e) => {
    e.preventDefault();
    onToggleChildren?.(tagPath);
  }, [onToggleChildren, tagPath]);

  return (
    <label className="d-inline">
      <div className="pgn__menu-item pgn__form-checkbox tag-toggle-item" role="group">
        <input
          type="checkbox"
          id={checkboxId}
          checked={isChecked}
          onChange={onClickCheckbox}
          className="pgn__form-checkbox-input flex-shrink-0"
        />
        {label}
        <Badge variant="light" pill className="ml-1">{tagCount}</Badge>
        {
          hasChildren
            ? (
              <IconButton
                src={isExpanded ? ArrowDropUp : ArrowDropDown}
                iconAs={Icon}
                alt={
                  intl.formatMessage(
                    isExpanded ? messages.childTagsCollapse : messages.childTagsExpand,
                    { tagName: label },
                  )
                }
                onClick={expandChildrenClick}
                variant="primary"
                size="sm"
              />
            ) : null
        }
      </div>
    </label>
  );
};

/**
 * A list of menu items with all of the options for tags at one level of the hierarchy.
 */
const TagOptions: React.FC<{
  tagSearchKeywords: string;
  parentTagPath?: string;
  toggleTagChildren?: (tagPath: string) => void;
  expandedTags: string[],
}> = ({
  parentTagPath = '',
  tagSearchKeywords,
  expandedTags,
  toggleTagChildren,
}) => {
  const searchContext = useSearchContext();
  const { data, isLoading, isError } = useTagFilterOptions({
    ...searchContext,
    parentTagPath,
    tagSearchKeywords,
  });

  if (isError) {
    return <MenuItem disabled><FormattedMessage {...messages['blockTagsFilter.error']} /></MenuItem>;
  }
  if (isLoading || data.tags === undefined) {
    return <LoadingSpinner />;
  }

  // Show a message if there are no options at all to avoid the impression that the dropdown isn't working
  if (data.tags.length === 0 && !parentTagPath) {
    return <MenuItem disabled><FormattedMessage {...messages['blockTagsFilter.empty']} /></MenuItem>;
  }

  return (
    <div role="group">
      {
        data.tags.map(({ tagName, tagPath, ...t }) => {
          const isExpanded = expandedTags.includes(tagPath);
          return (
            <React.Fragment key={tagName}>
              <TagMenuItem
                label={tagName}
                tagCount={t.tagCount}
                tagPath={tagPath}
                isChecked={searchContext.tagsFilter.includes(tagPath)}
                onClickCheckbox={() => {
                  searchContext.setTagsFilter((tf) => (
                    tf.includes(tagPath) ? tf.filter(tp => tp !== tagPath) : [...tf, tagPath]
                  ));
                }}
                hasChildren={t.hasChildren}
                isExpanded={isExpanded}
                onToggleChildren={toggleTagChildren}
              />
              {isExpanded ? (
                <div className="ml-4">
                  <TagOptions
                    parentTagPath={tagPath}
                    expandedTags={expandedTags}
                    tagSearchKeywords={tagSearchKeywords}
                    toggleTagChildren={toggleTagChildren}
                  />
                </div>
              ) : null}
            </React.Fragment>
          );
        })
      }
      {
        // Sometimes, due to limitations of how the search index/API works, we aren't able to retrieve all the options:
        data.mayBeMissingResults
          ? (
            <MenuItem iconBefore={Warning} disabled>
              <FormattedMessage {...messages['blockTagsFilter.incomplete']} />
            </MenuItem>
          ) : null
      }
    </div>
  );
};

const FilterByTags: React.FC<Record<never, never>> = () => {
  const intl = useIntl();
  const { tagsFilter, setTagsFilter } = useSearchContext();
  const [tagSearchKeywords, setTagSearchKeywords] = React.useState('');

  // e.g. {"Location", "Location > North America"} if those two paths of the tag tree are expanded
  const [expandedTags, setExpandedTags] = React.useState<string[]>([]);
  const toggleTagChildren = React.useCallback((tagWithLineage: string) => {
    setExpandedTags(currentList => {
      if (currentList.includes(tagWithLineage)) {
        return currentList.filter(x => x !== tagWithLineage);
      }
      return [...currentList, tagWithLineage];
    });
  }, [setExpandedTags]);

  return (
    <SearchFilterWidget
      appliedFilters={tagsFilter.map(tf => ({ label: tf.split(TAG_SEP).pop() }))}
      label={<FormattedMessage {...messages.blockTagsFilter} />}
      clearFilter={() => setTagsFilter([])}
      icon={Tag}
    >
      <Form.Group className="pt-3 mb-0">
        <SearchField
          onSubmit={setTagSearchKeywords}
          onChange={setTagSearchKeywords}
          onClear={() => setTagSearchKeywords('')}
          value={tagSearchKeywords}
          screenReaderText={{
            label: intl.formatMessage(messages.searchTagsByKeywordPlaceholder),
            submitButton: intl.formatMessage(messages.submitSearchTagsByKeyword),
          }}
          placeholder={intl.formatMessage(messages.searchTagsByKeywordPlaceholder)}
          className="mx-3 mb-1"
        />
        <Menu className="filter-by-refinement-menu" style={{ boxShadow: 'none' }}>
          <TagOptions
            tagSearchKeywords={tagSearchKeywords}
            toggleTagChildren={toggleTagChildren}
            expandedTags={expandedTags}
          />
        </Menu>
      </Form.Group>
    </SearchFilterWidget>
  );
};

export default FilterByTags;

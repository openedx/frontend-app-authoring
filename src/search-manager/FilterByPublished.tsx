import React from 'react';
import {
  Badge,
  Form,
  Menu,
  MenuItem,
} from '@openedx/paragon';
import { FilterList } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import SearchFilterWidget from './SearchFilterWidget';
import { useSearchContext } from './SearchManager';
import { PublishStatus, SearchSortOption } from './data/api';

/**
 * A button with a dropdown that allows filtering the current search by publish status
 */
const FilterByPublished: React.FC<Record<never, never>> = () => {
  const [onlyPublished, setOnlyPublished] = React.useState(false);
  const intl = useIntl();
  const {
    publishStatus,
    publishStatusFilter,
    setPublishStatusFilter,
    searchSortOrder,
  } = useSearchContext();

  const clearFilters = React.useCallback(() => {
    setPublishStatusFilter([]);
  }, []);

  React.useEffect(() => {
    if (searchSortOrder === SearchSortOption.RECENTLY_PUBLISHED) {
      setPublishStatusFilter([PublishStatus.Published, PublishStatus.Modified]);
      setOnlyPublished(true);
    } else {
      setOnlyPublished(false);
    }
  }, [searchSortOrder]);

  const toggleFilterMode = React.useCallback((mode: PublishStatus) => {
    setPublishStatusFilter(oldList => {
      if (oldList.includes(mode)) {
        return oldList.filter(m => m !== mode);
      }
      return [...oldList, mode];
    });
  }, [setPublishStatusFilter]);
  const modeToLabel = {
    published: intl.formatMessage(messages.publishStatusPublished),
    modified: intl.formatMessage(messages.publishStatusModified),
    never: intl.formatMessage(messages.publishStatusNeverPublished),
  };
  const appliedFilters = publishStatusFilter.map(mode => ({ label: modeToLabel[mode] }));

  return (
    <SearchFilterWidget
      appliedFilters={appliedFilters}
      label={<FormattedMessage {...messages.publishStatusFilter} />}
      clearFilter={clearFilters}
      icon={FilterList}
    >
      <Form.Group className="mb-0">
        <Form.CheckboxSet
          name="publish-status-filter"
          value={publishStatusFilter}
        >
          <Menu className="block-type-refinement-menu" style={{ boxShadow: 'none' }}>
            <MenuItem
              as={Form.Checkbox}
              value={PublishStatus.Published}
              onChange={() => { toggleFilterMode(PublishStatus.Published); }}
            >
              <div>
                {intl.formatMessage(messages.publishStatusPublished)}
                <Badge variant="light" pill>{publishStatus[PublishStatus.Published] ?? 0}</Badge>
              </div>
            </MenuItem>
            <MenuItem
              as={Form.Checkbox}
              value={PublishStatus.Modified}
              onChange={() => { toggleFilterMode(PublishStatus.Modified); }}
            >
              <div>
                {intl.formatMessage(messages.publishStatusModified)}
                <Badge variant="light" pill>{publishStatus[PublishStatus.Modified] ?? 0}</Badge>
              </div>
            </MenuItem>
            <MenuItem
              as={Form.Checkbox}
              value={PublishStatus.NeverPublished}
              onChange={() => { toggleFilterMode(PublishStatus.NeverPublished); }}
              disabled={onlyPublished}
            >
              <div>
                {intl.formatMessage(messages.publishStatusNeverPublished)}
                <Badge variant="light" pill>{publishStatus[PublishStatus.NeverPublished] ?? 0}</Badge>
              </div>
            </MenuItem>
          </Menu>
        </Form.CheckboxSet>
      </Form.Group>
    </SearchFilterWidget>
  );
};

export default FilterByPublished;

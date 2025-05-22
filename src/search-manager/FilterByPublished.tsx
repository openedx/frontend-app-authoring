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
import { allPublishFilters, PublishStatus } from './data/api';

interface FilterByPublishedProps {
  visibleFilters?: PublishStatus[],
}

/**
 * A button with a dropdown that allows filtering the current search by publish status
 */
const FilterByPublished = ({
  visibleFilters = allPublishFilters,
}: FilterByPublishedProps) => {
  const intl = useIntl();
  const {
    publishStatus,
    publishStatusFilter,
    setPublishStatusFilter,
  } = useSearchContext();

  const clearFilters = React.useCallback(() => {
    setPublishStatusFilter([]);
  }, []);

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

  const filterLabels = {
    [PublishStatus.Published]: intl.formatMessage(messages.publishStatusPublished),
    [PublishStatus.Modified]: intl.formatMessage(messages.publishStatusModified),
    [PublishStatus.NeverPublished]: intl.formatMessage(messages.publishStatusNeverPublished),
  };

  const visibleFiltersToRender = visibleFilters.map((filter) => (
    <MenuItem
      key={filter}
      as={Form.Checkbox}
      value={filter}
      onChange={() => { toggleFilterMode(filter); }}
    >
      <div>
        {filterLabels[filter]}
        <Badge variant="light" pill>{publishStatus[filter] ?? 0}</Badge>
      </div>
    </MenuItem>
  ));

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
            {visibleFiltersToRender}
          </Menu>
        </Form.CheckboxSet>
      </Form.Group>
    </SearchFilterWidget>
  );
};

export default FilterByPublished;

import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Badge,
  Form,
  Menu,
  MenuItem,
} from '@openedx/paragon';
import { FilterList } from '@openedx/paragon/icons';
import SearchFilterWidget from './SearchFilterWidget';
import messages from './messages';
// import { useSearchContext } from './SearchManager';

/**
 * A button with a dropdown that allows filtering the current search by publish status
 */
const FilterByPublished: React.FC<Record<never, never>> = () => {
  // const {
  //   publishedFilter,
  //   setPublishedFilter,
  // } = useSearchContext();

  const clearFilters = React.useCallback(() => {
    // setPublishedFilter(undefined);
  }, []);

  return (
    <SearchFilterWidget
      appliedFilters={[]}
      label="Publish Status"
      clearFilter={clearFilters}
      icon={FilterList}
    >
      <Form.Group className="mb-0">
        <Form.CheckboxSet
          name="block-type-filter"
          value={[]}
        >
          <Menu className="block-type-refinement-menu" style={{ boxShadow: 'none' }}>
            <MenuItem
              as={Form.Checkbox}
              value={1}
              onChange={() => {}}
            >
              <div>
                Published
                <Badge variant="light" pill>15</Badge>
              </div>
            </MenuItem>
            <MenuItem
              as={Form.Checkbox}
              value={2}
              onChange={() => {}}
            >
              <div>
                Modified since publish
                <Badge variant="light" pill>5</Badge>
              </div>
            </MenuItem>
            <MenuItem
              as={Form.Checkbox}
              value={3}
              onChange={() => {}}
            >
              <div>
                Never published
                <Badge variant="light" pill>2</Badge>
              </div>
            </MenuItem>
          </Menu>
        </Form.CheckboxSet>
      </Form.Group>
    </SearchFilterWidget>
  );
};

export default FilterByPublished;

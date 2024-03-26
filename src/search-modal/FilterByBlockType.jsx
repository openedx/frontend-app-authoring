/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button,
  Badge,
  Form,
  Menu,
  MenuItem,
} from '@openedx/paragon';
import {
  useRefinementList,
} from 'react-instantsearch';
import SearchFilterWidget from './SearchFilterWidget';
import messages from './messages';
import BlockTypeLabel from './BlockTypeLabel';

/**
 * Helper function to keep the list of component types sorted by popularity,
 * so they don't move around the list when one or more gets selected.
 * (the default sort puts checked items before others)
 * @type {<T extends {count: number}>(items: T[]) => T[]}
 */
const transformItems = (items) => items.slice().sort((a, b) => b.count - a.count);

/** @type {React.FC} */
const FilterByBlockType = () => {
  const {
    items,
    refine,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useRefinementList({ attribute: 'block_type', transformItems });

  const appliedItems = items.filter(item => item.isRefined);

  const handleCheckboxChange = React.useCallback((e) => {
    refine(e.target.value);
  }, [refine]);

  return (
    <SearchFilterWidget
      appliedFilters={appliedItems.map(item => ({ label: <BlockTypeLabel type={item.value} /> }))}
      label={<FormattedMessage {...messages['courseSearch.blockTypeFilter']} />}
    >
      <Form.Group>
        <Form.CheckboxSet
          name="block-type-filter"
          defaultValue={appliedItems.map(item => item.value)}
        >
          <Menu style={{ boxShadow: 'none' }}>
            {
              items.map((item) => (
                <MenuItem
                  key={item.value}
                  as={Form.Checkbox}
                  value={item.value}
                  checked={item.isRefined}
                  onChange={handleCheckboxChange}
                >
                  <BlockTypeLabel type={item.value} />{' '}
                  <Badge variant="light" pill>{item.count}</Badge>
                </MenuItem>
              ))
            }
            {
              // Show a message if there are no options at all to avoid the impression that the dropdown isn't working
              items.length === 0 ? (
                <MenuItem disabled><FormattedMessage {...messages['courseSearch.blockTypeFilter.empty']} /></MenuItem>
              ) : null
            }
          </Menu>
        </Form.CheckboxSet>
      </Form.Group>
      {
        canToggleShowMore && !isShowingMore
          ? <Button onClick={toggleShowMore}><FormattedMessage {...messages['courseSearch.showMore']} /></Button>
          : null
      }
    </SearchFilterWidget>
  );
};

export default FilterByBlockType;

/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Badge,
  Form,
  Menu,
  MenuItem,
} from '@openedx/paragon';
import SearchFilterWidget from './SearchFilterWidget';
import messages from './messages';
import BlockTypeLabel from './BlockTypeLabel';
import { useSearchContext } from './manager/SearchManager';

/**
 * A button with a dropdown that allows filtering the current search by component type (XBlock type)
 * e.g. Limit results to "Text" (html) and "Problem" (problem) components.
 * The button displays the first type selected, and a count of how many other types are selected, if more than one.
 * @type {React.FC<Record<never, never>>}
 */
const FilterByBlockType = () => {
  const {
    blockTypes,
    blockTypesFilter,
    setBlockTypesFilter,
  } = useSearchContext();
  // TODO: sort blockTypes first by count, then by name

  const handleCheckboxChange = React.useCallback((e) => {
    setBlockTypesFilter(currentFilters => {
      if (currentFilters.includes(e.target.value)) {
        return currentFilters.filter(x => x !== e.target.value);
      }
      return [...currentFilters, e.target.value];
    });
  }, [setBlockTypesFilter]);

  return (
    <SearchFilterWidget
      appliedFilters={blockTypesFilter.map(blockType => ({ label: <BlockTypeLabel type={blockType} /> }))}
      label={<FormattedMessage {...messages.blockTypeFilter} />}
    >
      <Form.Group>
        <Form.CheckboxSet
          name="block-type-filter"
          defaultValue={blockTypesFilter}
        >
          <Menu className="block-type-refinement-menu" style={{ boxShadow: 'none' }}>
            {
              Object.entries(blockTypes).map(([blockType, count]) => (
                <MenuItem
                  key={blockType}
                  as={Form.Checkbox}
                  value={blockType}
                  checked={blockTypesFilter.includes(blockType)}
                  onChange={handleCheckboxChange}
                >
                  <BlockTypeLabel type={blockType} />{' '}
                  <Badge variant="light" pill>{count}</Badge>
                </MenuItem>
              ))
            }
            {
              // Show a message if there are no options at all to avoid the impression that the dropdown isn't working
              blockTypes.length === 0 ? (
                <MenuItem disabled><FormattedMessage {...messages['blockTypeFilter.empty']} /></MenuItem>
              ) : null
            }
          </Menu>
        </Form.CheckboxSet>
      </Form.Group>
    </SearchFilterWidget>
  );
};

export default FilterByBlockType;

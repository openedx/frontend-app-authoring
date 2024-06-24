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
 */
const FilterByBlockType: React.FC<Record<never, never>> = () => {
  const {
    blockTypes,
    blockTypesFilter,
    setBlockTypesFilter,
  } = useSearchContext();

  // Sort blocktypes in order of hierarchy followed by alphabetically for components
  const sortedBlockTypeKeys = Object.keys(blockTypes).sort((a, b) => {
    const order = {
      chapter: 1,
      sequential: 2,
      vertical: 3,
    };

    // If both blocktypes are in the order dictionary, sort them based on the order defined
    if (a in order && b in order) {
      return order[a] - order[b];
    }

    // If only blocktype 'a' is in the order dictionary, place it before 'b'
    if (a in order) {
      return -1;
    }

    // If only blocktype 'b' is in the order dictionary, place it before 'a'
    if (b in order) {
      return 1;
    }

    // If neither blocktype is in the order dictionary, sort alphabetically
    return a.localeCompare(b);
  });

  // Rebuild sorted blocktypes dictionary
  const sortedBlockTypes: Record<string, number> = {};
  sortedBlockTypeKeys.forEach(key => {
    sortedBlockTypes[key] = blockTypes[key];
  });

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
              Object.entries(sortedBlockTypes).map(([blockType, count]) => (
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
              Object.keys(sortedBlockTypes).length === 0 ? (
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

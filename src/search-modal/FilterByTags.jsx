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
import { useHierarchicalMenu } from 'react-instantsearch';
import SearchFilterWidget from './SearchFilterWidget';
import messages from './messages';

// eslint-disable-next-line max-len
/** @typedef {import('instantsearch.js/es/connectors/hierarchical-menu/connectHierarchicalMenu').HierarchicalMenuItem} HierarchicalMenuItem */

/**
 * A button with a dropdown menu to allow filtering the search using tags.
 * This version is based on Instantsearch's <HierarchichalMenu/> component, so it only allows selecting one tag at a
 * time. We will replace it with a custom version that allows multi-select.
 * @type {React.FC<{
 *   items: HierarchicalMenuItem[],
 *   refine: (value: string) => void,
 *   depth?: number,
 * }>}
 */
const FilterOptions = ({ items, refine, depth = 0 }) => {
  const handleCheckboxChange = React.useCallback((e) => {
    refine(e.target.value);
  }, [refine]);

  return (
    <>
      {
        items.map((item) => (
          <React.Fragment key={item.value}>
            <MenuItem
              as={Form.Checkbox}
              value={item.value}
              checked={item.isRefined}
              onChange={handleCheckboxChange}
              className={`tag-option-${depth}`}
            >
              {item.label}{' '}
              <Badge variant="light" pill>{item.count}</Badge>
            </MenuItem>
            {item.data && <FilterOptions items={item.data} refine={refine} depth={depth + 1} />}
          </React.Fragment>
        ))
      }
    </>
  );
};

/** @type {React.FC} */
const FilterByTags = () => {
  const {
    items,
    refine,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useHierarchicalMenu({
    attributes: [
      'tags.taxonomy',
      'tags.level0',
      'tags.level1',
      'tags.level2',
      'tags.level3',
    ],
  });

  // Recurse over the 'items' tree and find all the selected leaf tags - (with no children that are checked/"refined")
  const appliedItems = React.useMemo(() => {
    /** @type {{label: string}[]} */
    const result = [];
    /** @type {(itemSet: HierarchicalMenuItem[]) => void} */
    const findSelectedLeaves = (itemSet) => {
      itemSet.forEach(item => {
        if (item.isRefined && item.data?.find(child => child.isRefined) === undefined) {
          result.push({ label: item.label });
        }
        if (item.data) {
          findSelectedLeaves(item.data);
        }
      });
    };
    findSelectedLeaves(items);
    return result;
  }, [items]);

  return (
    <SearchFilterWidget
      appliedFilters={appliedItems}
      label={<FormattedMessage {...messages.blockTagsFilter} />}
    >
      <Form.Group>
        <Menu style={{ boxShadow: 'none' }}>
          <FilterOptions items={items} refine={refine} />
          {
            // Show a message if there are no options at all to avoid the impression that the dropdown isn't working
            items.length === 0 ? (
              <MenuItem disabled><FormattedMessage {...messages['blockTagsFilter.empty']} /></MenuItem>
            ) : null
          }
        </Menu>
      </Form.Group>
      {
        canToggleShowMore && !isShowingMore
          ? <Button onClick={toggleShowMore}><FormattedMessage {...messages.showMore} /></Button>
          : null
      }
    </SearchFilterWidget>
  );
};

export default FilterByTags;

import React, { useCallback, useEffect } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Badge,
  Form,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  ModalPopup,
  useToggle,
} from '@openedx/paragon';
import { KeyboardArrowRight, FilterList } from '@openedx/paragon/icons';
import SearchFilterWidget from './SearchFilterWidget';
import messages from './messages';
import BlockTypeLabel from './BlockTypeLabel';
import { useSearchContext } from './SearchManager';

interface ProblemFilterItemProps {
  count: number,
  handleCheckboxChange: (e: any) => void;
}
interface FilterItemProps {
  blockType: string,
  count: number,
}

const ProblemFilterItem = ({ count, handleCheckboxChange } : ProblemFilterItemProps) => {
  const blockType = 'problem';

  const {
    problemTypes,
    typesFilter,
    setTypesFilter,
  } = useSearchContext();
  const intl = useIntl();

  const problemTypesLength = Object.values(problemTypes).length;

  const [isProblemItemOpen, openProblemItem, closeProblemItem] = useToggle(false);
  const [isProblemIndeterminate, setIsProblemIndeterminate] = React.useState(false);
  const [problemItemTarget, setProblemItemTarget] = React.useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    /* istanbul ignore next */
    const selectedProblemTypes = typesFilter.problems.size;
    if (!selectedProblemTypes || selectedProblemTypes === problemTypesLength) {
      setIsProblemIndeterminate(false);
    } else if (selectedProblemTypes) {
      setIsProblemIndeterminate(true);
    }
  }, [typesFilter, problemTypesLength, setIsProblemIndeterminate]);

  const handleProblemCheckboxChange = React.useCallback((e) => {
    setTypesFilter((types) => {
      if (e.target.checked) {
        types.problems.add(e.target.value);
      } else {
        types.problems.delete(e.target.value);
      }

      if (types.problems.size === problemTypesLength) {
        // Add 'problem' to block type filter if all problem types are selected.
        types.blocks.add(blockType);
      } else {
        // Delete 'problem' filter if its selected.
        types.blocks.delete(blockType);
      }

      return types;
    });
  }, [setTypesFilter, problemTypesLength]);

  return (
    <div className="problem-menu-item">
      <MenuItem
        key={blockType}
        as={Form.Checkbox}
        value={blockType}
        onChange={handleCheckboxChange}
        isIndeterminate={isProblemIndeterminate}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <BlockTypeLabel blockType={blockType} />{' '}
            <Badge variant="light" pill>{count}</Badge>
          </div>
          { Object.keys(problemTypes).length !== 0 && (
            <IconButton
              ref={setProblemItemTarget}
              variant="dark"
              iconAs={Icon}
              src={KeyboardArrowRight}
              onClick={openProblemItem}
              data-testid="open-problem-item-button"
              alt={intl.formatMessage(messages.openProblemSubmenuAlt)}
            />
          )}
        </div>
      </MenuItem>
      <ModalPopup
        positionRef={problemItemTarget}
        isOpen={isProblemItemOpen}
        onClose={closeProblemItem}
      >
        <div
          className="bg-white rounded shadow problem-sub-menu-item"
        >
          <Form.Group className="mb-0">
            <Form.CheckboxSet
              name="block-type-filter"
              value={[...typesFilter.problems]}
            >
              <Menu>
                { Object.entries(problemTypes).map(([problemType, problemTypeCount]) => (
                  <MenuItem
                    key={problemType}
                    as={Form.Checkbox}
                    value={problemType}
                    onChange={handleProblemCheckboxChange}
                  >
                    <div style={{ textAlign: 'start' }}>
                      <BlockTypeLabel blockType={problemType} />{' '}
                      <Badge variant="light" pill>{problemTypeCount}</Badge>
                    </div>
                  </MenuItem>
                ))}
                {
                  // Show a message if there are no options at all to avoid the
                  // impression that the dropdown isn't working
                  Object.keys(problemTypes).length === 0 ? (
                    /* istanbul ignore next */
                    <MenuItem disabled><FormattedMessage {...messages['blockTypeFilter.empty']} /></MenuItem>
                  ) : null
                }
              </Menu>
            </Form.CheckboxSet>
          </Form.Group>
        </div>
      </ModalPopup>
    </div>
  );
};

const FilterItem = ({ blockType, count } : FilterItemProps) => {
  const {
    problemTypes,
    setTypesFilter,
  } = useSearchContext();

  const handleCheckboxChange = React.useCallback((e) => {
    setTypesFilter((types) => {
      if (e.target.checked) {
        types.blocks.add(e.target.value);
      } else {
        types.blocks.delete(e.target.value);
      }
      // The "problem" block type also selects/clears all the problem types
      if (blockType === 'problem') {
        if (e.target.checked) {
          types.union({ problems: Object.keys(problemTypes) });
        } else {
          types.problems.clear();
        }
      }
      return types;
    });
  }, [setTypesFilter]);

  if (blockType === 'problem') {
    // Build Capa Problem types filter submenu
    return (
      <ProblemFilterItem
        count={count}
        handleCheckboxChange={handleCheckboxChange}
      />
    );
  }

  return (
    <MenuItem
      as={Form.Checkbox}
      value={blockType}
      onChange={handleCheckboxChange}
    >
      <div>
        <BlockTypeLabel blockType={blockType} />{' '}
        <Badge variant="light" pill>{count}</Badge>
      </div>
    </MenuItem>
  );
};

/**
 * A button with a dropdown that allows filtering the current search by component type (XBlock type)
 * e.g. Limit results to "Text" (html) and "Problem" (problem) components.
 * The button displays the first type selected, and a count of how many other types are selected, if more than one.
 */
const FilterByBlockType: React.FC<Record<never, never>> = () => {
  const {
    blockTypes,
    typesFilter,
    setTypesFilter,
  } = useSearchContext();

  const clearFilters = useCallback(/* istanbul ignore next */ () => {
    setTypesFilter((types) => types.clear());
  }, [setTypesFilter]);

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

  const appliedFilters = [...typesFilter.blocks, ...typesFilter.problems].map(
    blockType => ({ label: <BlockTypeLabel blockType={blockType} /> }),
  );

  return (
    <SearchFilterWidget
      appliedFilters={appliedFilters}
      label={<FormattedMessage {...messages.blockTypeFilter} />}
      clearFilter={clearFilters}
      icon={FilterList}
    >
      <Form.Group className="mb-0">
        <Form.CheckboxSet
          name="block-type-filter"
          value={[...typesFilter.blocks]}
        >
          <Menu className="block-type-refinement-menu" style={{ boxShadow: 'none' }}>
            {
              Object.entries(sortedBlockTypes).map(([blockType, count]) => (
                <FilterItem key={blockType} blockType={blockType} count={count} />
              ))
            }
            {
              // Show a message if there are no options at all to avoid the impression that the dropdown isn't working
              Object.keys(sortedBlockTypes).length === 0 && (
                <MenuItem disabled><FormattedMessage {...messages['blockTypeFilter.empty']} /></MenuItem>
              )
            }
          </Menu>
        </Form.CheckboxSet>
      </Form.Group>
    </SearchFilterWidget>
  );
};

export default FilterByBlockType;

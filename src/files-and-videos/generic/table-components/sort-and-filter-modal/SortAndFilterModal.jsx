import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  DataTableContext,
  Form,
  ModalDialog,
  useCheckboxSetValues,
} from '@openedx/paragon';
import messages from './messages';
// SelectableBox in paragon has a bug only visible on stage where you can't change selection. So we override it
import SelectableBox from '../../../../editors/sharedComponents/SelectableBox';
import { getCheckedFilters, getFilterOptions, processFilters } from './utils';

const SortAndFilterModal = ({
  isSortOpen,
  closeSort,
  handleSort,
  // injected
  intl,
}) => {
  const {
    state, setAllFilters, columns, gotoPage,
  } = useContext(DataTableContext);
  const filterOptions = getFilterOptions(columns);
  const currentFilters = getCheckedFilters(state);
  const [sortBy, setSortBy] = useState('dateAdded,desc');
  const [filterBy, {
    add, remove, set, clear,
  }] = useCheckboxSetValues(currentFilters);

  useEffect(() => {
    const updatedFilters = getCheckedFilters(state);
    set(updatedFilters);
  }, [state]);

  const handleChange = (e) => {
    // eslint-disable-next-line no-console
    console.log('SortAndFilterModal | handleChange called | e: ', e);
    setSortBy(e.target.value);
  };

  const handleFilterUpdate = (e) => {
    if (e.target.checked) {
      add(e.target.value);
    } else {
      remove(e.target.value);
    }
  };
  const handleApply = async () => {
    await handleSort(sortBy);
    processFilters(filterBy, columns, setAllFilters);
    gotoPage(0);
    closeSort();
  };

  const handleClearAll = () => {
    setSortBy('dateAdded,desc');
    clear();
  };

  return (
    <ModalDialog
      title={intl.formatMessage(messages.modalTitle)}
      isOpen={isSortOpen}
      onClose={closeSort}
      size="lg"
      hasCloseButton
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage {...messages.modalTitle} />
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className="h4 mb-4">
          <FormattedMessage {...messages.sortByHeader} />
        </div>
        <SelectableBox.Set
          type="radio"
          value={sortBy}
          onChange={handleChange}
          name="sort options"
          columns={3}
          ariaLabel="sort by selection"
          className="mb-4.5"
        >
          <SelectableBox
            className="text-center"
            value="displayName,asc"
            type="radio"
            aria-label="name descending radio"
          >
            <FormattedMessage {...messages.sortByNameAscending} />
          </SelectableBox>
          <SelectableBox
            className="text-center"
            value="dateAdded,desc"
            type="radio"
            aria-label="date added descending radio"
          >
            <FormattedMessage {...messages.sortByNewest} />
          </SelectableBox>
          <SelectableBox
            className="text-center"
            value="fileSize,desc"
            type="radio"
            aria-label="file size descending radio"
          >
            <FormattedMessage {...messages.sortBySizeDescending} />
          </SelectableBox>
          <SelectableBox
            className="text-center"
            value="displayName,desc"
            type="radio"
            aria-label="name ascending radio"
          >
            <FormattedMessage {...messages.sortByNameDescending} />
          </SelectableBox>
          <SelectableBox
            className="text-center"
            value="dateAdded,asc"
            type="radio"
            aria-label="date added ascending radio"
          >
            <FormattedMessage {...messages.sortByOldest} />
          </SelectableBox>
          <SelectableBox
            className="text-center"
            value="fileSize,asc"
            type="radio"
            aria-label="file size ascending radio"
          >
            <FormattedMessage {...messages.sortBySizeAscending} />
          </SelectableBox>
        </SelectableBox.Set>
        <hr />
        <div className="h4 my-4">
          <FormattedMessage {...messages.filterByHeader} />
        </div>
        <Form.Group>
          <Form.CheckboxSet
            name="filters"
            onChange={handleFilterUpdate}
            value={filterBy}
            isInline
          >
            {filterOptions.map(({ name, value }) => (
              <Form.Checkbox {...{ value, key: value }}>{name}</Form.Checkbox>
            ))}
          </Form.CheckboxSet>
        </Form.Group>
        <Button className="pl-0" variant="link" onClick={handleClearAll}>
          <FormattedMessage {...messages.clearAllButtonLabel} />
        </Button>
        <hr />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            <FormattedMessage {...messages.cancelButtonLabel} />
          </ModalDialog.CloseButton>
          <Button
            variant="primary"
            onClick={handleApply}
          >
            <FormattedMessage {...messages.applySortButton} />
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

SortAndFilterModal.propTypes = {
  handleSort: PropTypes.func.isRequired,
  isSortOpen: PropTypes.bool.isRequired,
  closeSort: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(SortAndFilterModal);

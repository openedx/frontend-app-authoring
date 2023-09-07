import React, { useState } from 'react';
import _ from 'lodash';
import { PropTypes } from 'prop-types';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Dropdown,
  ModalDialog,
  SelectableBox,
  useToggle,
} from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import messages from '../messages';

const TableActions = ({
  selectedFlatRows,
  fileInputControl,
  handleSort,
  handleBulkDownload,
  handleOpenDeleteConfirmation,
  // injected
  intl,
}) => {
  const [isSortOpen, openSort, closeSort] = useToggle(false);
  const [sortBy, setSortBy] = useState('dateAdded,desc');
  const handleChange = (e) => {
    setSortBy(e.target.value);
  };
  return (
    <>
      <Button variant="outline-primary" onClick={openSort}>
        <FormattedMessage {...messages.sortButtonLabel} />
      </Button>
      <Dropdown className="mx-2">
        <Dropdown.Toggle
          id="actions-menu-toggle"
          alt="actions-menu-toggle"
          variant="outline-primary"
        >
          <FormattedMessage {...messages.actionsButtonLabel} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() => handleBulkDownload(selectedFlatRows)}
            disabled={_.isEmpty(selectedFlatRows)}
          >
            <FormattedMessage {...messages.downloadTitle} />
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            data-testid="open-delete-confirmation-button"
            onClick={() => handleOpenDeleteConfirmation(selectedFlatRows)}
            disabled={_.isEmpty(selectedFlatRows)}
          >
            <FormattedMessage {...messages.deleteTitle} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Button iconBefore={Add} onClick={fileInputControl.click}>
        <FormattedMessage {...messages.addFilesButtonLabel} />
      </Button>
      <ModalDialog
        title={intl.formatMessage(messages.sortModalTitleLabel)}
        isOpen={isSortOpen}
        onClose={closeSort}
        size="lg"
        hasCloseButton
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            <FormattedMessage {...messages.sortModalTitleLabel} />
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <SelectableBox.Set
            type="radio"
            value={sortBy}
            onChange={handleChange}
            name="sort options"
            columns={3}
            ariaLabel="sort by selection"
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
              aria-label="date added descending radio"
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
              aria-label="date added ascending radio"
            >
              <FormattedMessage {...messages.sortBySizeAscending} />
            </SelectableBox>
          </SelectableBox.Set>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              <FormattedMessage {...messages.cancelButtonLabel} />
            </ModalDialog.CloseButton>
            <Button
              variant="primary"
              onClick={() => {
                closeSort();
                handleSort(sortBy);
              }}
            >
              <FormattedMessage {...messages.applySortButton} />
            </Button>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

TableActions.defaultProps = {
  selectedFlatRows: null,
};
TableActions.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(
    PropTypes.shape({
      original: PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        wrapperType: PropTypes.string.isRequired,
        locked: PropTypes.bool.isRequired,
        externalUrl: PropTypes.string.isRequired,
        thumbnail: PropTypes.string,
        id: PropTypes.string.isRequired,
        portableUrl: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ),
  fileInputControl: PropTypes.shape({
    click: PropTypes.func.isRequired,
  }).isRequired,
  handleOpenDeleteConfirmation: PropTypes.func.isRequired,
  handleBulkDownload: PropTypes.func.isRequired,
  handleSort: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(TableActions);

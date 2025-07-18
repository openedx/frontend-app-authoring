import React, { useContext, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { PropTypes } from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  Button,
  DataTableContext,
  Dropdown,
  useToggle,
} from '@openedx/paragon';
import { Add, Tune } from '@openedx/paragon/icons';
import messages from '../messages';
import SortAndFilterModal from './sort-and-filter-modal';

const TableActions = ({
  selectedFlatRows,
  fileInputControl,
  handleSort,
  handleBulkDownload,
  handleOpenDeleteConfirmation,
  encodingsDownloadUrl,
  fileType,
  setInitialState,
}) => {
  const intl = useIntl();
  const [isSortOpen, openSort, closeSort] = useToggle(false);
  const { state, clearSelection } = useContext(DataTableContext);

  // This useEffect saves DataTable state so it can persist after table re-renders due to data reload.
  useEffect(() => {
    setInitialState(state);
  }, [state]);

  const handleOpenFileSelector = () => {
    fileInputControl.click();
    clearSelection();
  };

  return (
    <>
      <Button variant="outline-primary" onClick={openSort} iconBefore={Tune}>
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
          {encodingsDownloadUrl ? (
            <Dropdown.Item
              download
              href={`${getConfig().STUDIO_BASE_URL}${encodingsDownloadUrl}`}
            >
              <FormattedMessage {...messages.downloadEncodingsTitle} />
            </Dropdown.Item>
          ) : null}
          <Dropdown.Item
            onClick={() => handleBulkDownload(selectedFlatRows)}
            disabled={isEmpty(selectedFlatRows)}
          >
            <FormattedMessage {...messages.downloadTitle} />
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            data-testid="open-delete-confirmation-button"
            onClick={() => handleOpenDeleteConfirmation(selectedFlatRows)}
            disabled={isEmpty(selectedFlatRows)}
          >
            <FormattedMessage {...messages.deleteTitle} />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Button iconBefore={Add} onClick={handleOpenFileSelector}>
        {intl.formatMessage(messages.addFilesButtonLabel, { fileType })}
      </Button>
      <SortAndFilterModal {...{ isSortOpen, closeSort, handleSort }} />
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
        locked: PropTypes.bool,
        externalUrl: PropTypes.string,
        thumbnail: PropTypes.string,
        id: PropTypes.string.isRequired,
        portableUrl: PropTypes.string,
      }).isRequired,
    }),
  ),
  fileInputControl: PropTypes.shape({
    click: PropTypes.func.isRequired,
  }).isRequired,
  handleOpenDeleteConfirmation: PropTypes.func.isRequired,
  handleBulkDownload: PropTypes.func.isRequired,
  encodingsDownloadUrl: PropTypes.string,
  handleSort: PropTypes.func.isRequired,
  fileType: PropTypes.string.isRequired,
  setInitialState: PropTypes.func.isRequired,
};

TableActions.defaultProps = {
  encodingsDownloadUrl: null,
};

export default TableActions;

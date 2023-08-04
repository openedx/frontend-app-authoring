import React from 'react';
import _ from 'lodash';
import { PropTypes } from 'prop-types';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button, Dropdown } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import messages from '../messages';

const TableActions = ({
  selectedFlatRows,
  fileInputControl,
  handleBulkDelete,
  handleBulkDownload,
}) => (
  <>
    <Dropdown>
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
          onClick={() => handleBulkDelete(selectedFlatRows)}
          disabled={_.isEmpty(selectedFlatRows)}
        >
          <FormattedMessage {...messages.deleteTitle} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
    <Button iconBefore={Add} onClick={fileInputControl.click} className="ml-2">
      <FormattedMessage {...messages.addFilesButtonLabel} />
    </Button>
  </>
);

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
  handleBulkDelete: PropTypes.func.isRequired,
  handleBulkDownload: PropTypes.func.isRequired,
};

export default injectIntl(TableActions);

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  ActionRow,
  AlertModal,
  Button,
  Collapsible,
  Hyperlink,
  Truncate,
} from '@openedx/paragon';

import messages from './messages';

const DeleteConfirmationModal = ({
  isDeleteConfirmationOpen,
  closeDeleteConfirmation,
  handleBulkDelete,
  selectedRows,
  fileType,
  // injected
  intl,
}) => {
  const firstSelectedRow = selectedRows[0]?.original;
  let activeContentRows = [];
  if (Array.isArray(selectedRows)) {
    activeContentRows = selectedRows.filter(row => row.original?.activeStatus === 'active');
  }
  const isDeletingCourseContent = activeContentRows.length > 0;

  const deletedCourseContent = activeContentRows.map(({ original }) => (
    <li style={{ listStyle: 'None' }} key={original.id}>
      <Collapsible
        styling="basic"
        title={(
          <h3 className="h5 m-n2">
            <Truncate lines={1}>
              {original.displayName}
            </Truncate>
          </h3>
        )}
        data-testid={`collapsible-${original.id}`}
      >
        <ul className="px-2 py-0">
          {original.usageLocations.map(location => (
            <li key={`usage-location-${location.displayLocation}`} style={{ listStyle: 'square' }}>
              <Hyperlink destination={`${getConfig().STUDIO_BASE_URL}${location.url}`} target="_blank">
                {location.displayLocation}
              </Hyperlink>
            </li>
          ))}
        </ul>
      </Collapsible>
    </li>
  ));

  return (
    <AlertModal
      className="small"
      title={intl.formatMessage(
        messages.deleteConfirmationTitle,
        {
          fileName: firstSelectedRow?.displayName,
          fileNumber: selectedRows.length,
          fileType,
        },
      )}
      isOpen={isDeleteConfirmationOpen}
      onClose={closeDeleteConfirmation}
      footerNode={(
        <ActionRow>
          <Button variant="tertiary" onClick={closeDeleteConfirmation}>
            {intl.formatMessage(messages.cancelButtonLabel)}
          </Button>
          <Button onClick={handleBulkDelete}>
            {intl.formatMessage(messages.deleteFileButtonLabel)}
          </Button>
        </ActionRow>
      )}
    >
      {intl.formatMessage(
        messages.deleteConfirmationMessage,
        {
          fileName: firstSelectedRow?.displayName,
          fileNumber: selectedRows.length,
          fileType,
        },
      )}
      {isDeletingCourseContent && (
        <div className="mt-3">
          {intl.formatMessage(
            messages.deleteConfirmationUsageMessage,
            {
              fileNumber: activeContentRows.length,
              fileType,
            },
          )}
          <ul className="p-0">
            {deletedCourseContent}
          </ul>
        </div>
      )}
    </AlertModal>
  );
};

DeleteConfirmationModal.defaultProps = {
  selectedRows: [],
};

DeleteConfirmationModal.propTypes = {
  selectedRows: PropTypes.arrayOf(PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string,
      displayName: PropTypes.string,
      activeStatus: PropTypes.string,
      usageLocations: PropTypes.arrayOf(PropTypes.shape({
        url: PropTypes.string,
        displayLocation: PropTypes.string,
      })),
    }),
  })),
  isDeleteConfirmationOpen: PropTypes.bool.isRequired,
  closeDeleteConfirmation: PropTypes.func.isRequired,
  handleBulkDelete: PropTypes.func.isRequired,
  fileType: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(DeleteConfirmationModal);

import React from 'react';
import PropTypes from 'prop-types';

import {
  Spinner,
  ActionRow,
  Button,
  ModalDialog,
  Toast,
} from '@openedx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

export const EditorFooter = ({
  clearSaveFailed,
  disableSave,
  onCancel,
  onSave,
  saveFailed,
  // injected
  intl,
}) => (
  <div className="editor-footer fixed-bottom">
    {saveFailed && (
      <Toast show onClose={clearSaveFailed}>
        <FormattedMessage {...messages.contentSaveFailed} />
      </Toast>
    )}
    <ModalDialog.Footer className="shadow-sm">
      <ActionRow>
        <Button
          aria-label={intl.formatMessage(messages.cancelButtonAriaLabel)}
          variant="tertiary"
          onClick={onCancel}
        >
          <FormattedMessage {...messages.cancelButtonLabel} />
        </Button>
        <Button
          aria-label={intl.formatMessage(messages.saveButtonAriaLabel)}
          onClick={onSave}
          disabled={disableSave}
        >
          {disableSave
            ? <Spinner animation="border" className="mr-3" />
            : <FormattedMessage {...messages.saveButtonLabel} />}
        </Button>
      </ActionRow>
    </ModalDialog.Footer>
  </div>
);

EditorFooter.propTypes = {
  clearSaveFailed: PropTypes.func.isRequired,
  disableSave: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saveFailed: PropTypes.bool.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(EditorFooter);

import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Spinner,
  ActionRow,
  Button,
  ModalDialog,
  Toast,
  Hyperlink,
} from '@openedx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { selectors } from '../../../../data/redux';
import { blockTypes } from '../../../../data/constants/app';

import messages from './messages';

export const EditorFooter = ({
  clearSaveFailed,
  disableSave,
  onCancel,
  onSave,
  saveFailed,
  // injected
  intl,
}) => {
  const blockType = useSelector(selectors.app.blockType);

  return (
    <div className="editor-footer fixed-bottom">
      {saveFailed && (
        <Toast show onClose={clearSaveFailed}>
          <FormattedMessage {...messages.contentSaveFailed} />
        </Toast>
      )}

      <ModalDialog.Footer className="shadow-sm">
        <ActionRow>
          {
        // TODO: Remove this code when the problem Editor Beta is complete.
        blockType === blockTypes.problem
          && (
          <Hyperlink destination="https://docs.google.com/forms/d/e/1FAIpQLSdmtO5at9WWHLcWLrOgk1oMz97gYYYrUq4cvH8Vzd-WQwM0Cg/viewform?usp=sharing" target="_blank">
            Share Feedback
          </Hyperlink>
          )
        }
          <ActionRow.Spacer />
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
};
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

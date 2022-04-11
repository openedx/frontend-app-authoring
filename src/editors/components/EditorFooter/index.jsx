import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Spinner,
  ActionRow,
  Button,
  ModalDialog,
  Toast,
} from '@edx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { nullMethod, saveBlock, navigateCallback } from '../../hooks';

import { RequestKeys } from '../../data/constants/requests';
import { selectors, thunkActions } from '../../data/redux';

import messages from './messages';
import * as module from '.';

export const handleSaveClicked = (props) => () => saveBlock(props);
export const handleCancelClicked = ({ returnUrl }) => navigateCallback(returnUrl);

export const EditorFooter = ({
  editorRef,
  // injected
  intl,
  // redux
  isInitialized,
  returnUrl,
  saveFailed,
  saveBlockContent,
}) => (
  <div className="editor-footer fixed-bottom">
    {saveFailed && (
      <Toast show onClose={nullMethod}><FormattedMessage {...messages.contentSaveFailed} /></Toast>
    )}

    <ModalDialog.Footer>
      <ActionRow>
        <ActionRow.Spacer />
        <Button
          aria-label={intl.formatMessage(messages.cancelButtonAriaLabel)}
          variant="tertiary"
          onClick={module.handleCancelClicked({ returnUrl })}
        >
          <FormattedMessage {...messages.cancelButtonLabel} />
        </Button>
        <Button
          aria-label={intl.formatMessage(messages.saveButtonAriaLabel)}
          onClick={module.handleSaveClicked({
            editorRef,
            returnUrl,
            saveFunction: saveBlockContent,
          })}
          disabled={!isInitialized}
        >
          {isInitialized
            ? <FormattedMessage {...messages.saveButtonLabel} />
            : <Spinner animation="border" className="mr-3" />}
        </Button>
      </ActionRow>
    </ModalDialog.Footer>
  </div>
);
EditorFooter.defaultProps = {
  editorRef: null,
  returnUrl: null,
};
EditorFooter.propTypes = {
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  // injected
  intl: intlShape.isRequired,
  // redux
  isInitialized: PropTypes.bool.isRequired,
  returnUrl: PropTypes.string,
  saveFailed: PropTypes.bool.isRequired,
  saveBlockContent: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  returnUrl: selectors.app.returnUrl(state),
  isInitialized: selectors.app.isInitialized(state),
  saveFailed: selectors.requests.isFailed(state, { requestKey: RequestKeys.saveBlock }),
  studioEndpointUrl: selectors.app.studioEndpointUrl(state),
});

export const mapDispatchToProps = {
  saveBlockContent: thunkActions.app.saveBlock,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(EditorFooter));

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
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { RequestKeys } from '../../data/constants/requests';
import { selectors, thunkActions } from '../../data/redux';
import { saveTextBlock, navigateCallback } from '../../hooks';
import messages from '../messages';
import * as module from '.';

export const handleSaveClicked = (props) => () => saveTextBlock(props);
export const handleCancelClicked = ({ returnUrl }) => navigateCallback(returnUrl);

export const EditorFooter = ({
  editorRef,
  // redux
  isInitialized,
  returnUrl,
  saveFailed,
  saveBlock,
}) => (
  <div className="editor-footer mt-auto">
    {saveFailed && (
      <Toast><FormattedMessage {...messages.contentSaveFailed} /></Toast>
    )}

    <ModalDialog.Footer>
      <ActionRow>
        <ActionRow.Spacer />
        <Button
          aria-label="Discard Changes and Return to Learning Context"
          variant="tertiary"
          onClick={module.handleCancelClicked({ returnUrl })}
        >
          Cancel
        </Button>
        <Button
          aria-label="Save Changes and Return to Learning Context"
          onClick={module.handleSaveClicked({
            editorRef,
            returnUrl,
            saveBlock,
          })}
          disabled={!isInitialized}
        >
          {isInitialized
            ? <FormattedMessage {...messages.addToCourse} />
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
  // redux
  isInitialized: PropTypes.bool.isRequired,
  returnUrl: PropTypes.string,
  saveFailed: PropTypes.bool.isRequired,
  saveBlock: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  isInitialized: selectors.app.isInitialized(state),
  saveFailed: selectors.requests.isFailed(state, { requestKey: RequestKeys.saveBlock }),
  studioEndpointUrl: selectors.app.studioEndpointUrl(state),
});

export const mapDispatchToProps = {
  saveBlock: thunkActions.app.saveBlock,
};

export default connect(mapStateToProps, mapDispatchToProps)(EditorFooter);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  ActionRow,
  IconButton,
  Icon,
  ModalDialog,
} from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { selectors } from '../../data/redux';
import * as appHooks from '../../hooks';

import HeaderTitle from './HeaderTitle';
import messages from './messages';

export const EditorHeader = ({ editorRef, intl, returnUrl }) => (
  <div className="editor-header">
    <ModalDialog.Header>
      <ActionRow>
        <ModalDialog.Title>
          <HeaderTitle editorRef={editorRef} />
        </ModalDialog.Title>
        <ActionRow.Spacer />
        <IconButton
          alt={intl.formatMessage(messages.cancelChangesLabel)}
          src={Close}
          iconAs={Icon}
          onClick={appHooks.navigateCallback(returnUrl)}
          variant="light"
          className="mr-2"
        />
      </ActionRow>
    </ModalDialog.Header>
  </div>
);
EditorHeader.propTypes = {
  editorRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]).isRequired,
  // injected
  intl: intlShape.isRequired,
  // redux
  returnUrl: PropTypes.string.isRequired,
};
export const mapStateToProps = (state) => ({
  returnUrl: selectors.app.returnUrl(state),
});

export default injectIntl(connect(mapStateToProps)(EditorHeader));

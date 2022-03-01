import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  ActionRow, IconButton, Icon, ModalDialog,
} from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import { selectors } from '../../data/redux';
import * as appHooks from '../../hooks';

import HeaderTitle from './HeaderTitle';

export const EditorHeader = ({
  returnUrl,
}) => (
  <div className="editor-header">
    <ModalDialog.Header>
      <ActionRow>
        <ModalDialog.Title><HeaderTitle /></ModalDialog.Title>
        <ActionRow.Spacer />
        <IconButton
          aria-label="Cancel Changes and Return to Learning Context"
          src={Close}
          iconAs={Icon}
          alt="Close"
          onClick={appHooks.navigateCallback(returnUrl)}
          variant="light"
          className="mr-2"
        />
      </ActionRow>
    </ModalDialog.Header>
  </div>
);
EditorHeader.propTypes = {
  returnUrl: PropTypes.string.isRequired,
};
export const mapStateToProps = (state) => ({
  returnUrl: selectors.app.returnUrl(state),
});

export default connect(mapStateToProps)(EditorHeader);

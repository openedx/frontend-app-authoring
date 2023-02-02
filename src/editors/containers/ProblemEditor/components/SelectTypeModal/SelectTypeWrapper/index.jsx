import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Icon, ModalDialog, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import SelectTypeFooter from './SelectTypeFooter';

import * as hooks from '../../../../EditorContainer/hooks';
import messages from './messages';

export const SelectTypeWrapper = ({
  children,
  onClose,
  selected,
}) => {
  const handleCancel = hooks.handleCancel({ onClose });

  return (
    <div
      className="position-relative zindex-0"
    >
      <ModalDialog.Header className="shadow-sm zindex-10">
        <ModalDialog.Title>
          <FormattedMessage {...messages.selectTypeTitle} />
          <div className="pgn__modal-close-container">
            <IconButton
              src={Close}
              iconAs={Icon}
              onClick={handleCancel}
            />
          </div>
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body classname="pb-6">
        {children}
      </ModalDialog.Body>
      <SelectTypeFooter
        selected={selected}
        onCancel={handleCancel}
      />
    </div>
  );
};

SelectTypeWrapper.defaultProps = {
  onClose: null,
};
SelectTypeWrapper.propTypes = {
  selected: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
};

export default injectIntl(SelectTypeWrapper);

import React from 'react';
import PropTypes from 'prop-types';

import { Icon, ModalDialog, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import SelectTypeFooter from './SelectTypeFooter';

import * as hooks from '../../../../EditorContainer/hooks';

export const SelectTypeWrapper = ({
  selected,
  onClose,
  children,
}) => {
  const handleCancelClicked = hooks.handleCancelClicked({ onClose });

  return (
    <div>
      <ModalDialog.Header>
        <ModalDialog.Title>
          <p>Select Problem type</p>
          <div className="pgn__modal-close-container">
            <IconButton
              src={Close}
              iconAs={Icon}
              onClick={handleCancelClicked}
            />
          </div>
        </ModalDialog.Title>
      </ModalDialog.Header>
      {children}
      <SelectTypeFooter
        selected={selected}
        onCancel={handleCancelClicked}
      />
    </div>
  );
};

SelectTypeWrapper.defaultProps = {
  onClose: null,
};
SelectTypeWrapper.propTypes = {
  selected: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
};

export default SelectTypeWrapper;

import React from 'react';
import PropTypes from 'prop-types';

import { Icon, ModalDialog, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import SelectTypeFooter from './SelectTypeFooter';

import * as hooks from '../../../../EditorContainer/hooks';

export const SelectTypeWrapper = ({
  children,
  onClose,
  selected,
}) => {
  const handleCancel = hooks.handleCancel({ onClose });

  return (
    <div>
      <ModalDialog.Header>
        <ModalDialog.Title>
          <p>Select Problem type</p>
          <div className="pgn__modal-close-container">
            <IconButton
              src={Close}
              iconAs={Icon}
              onClick={handleCancel}
            />
          </div>
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
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

export default SelectTypeWrapper;

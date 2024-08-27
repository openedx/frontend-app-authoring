import React from 'react';
import PropTypes from 'prop-types';

import { Form } from '@openedx/paragon';
import EditConfirmationButtons from './EditConfirmationButtons';

const EditableHeader = ({
  handleChange,
  updateTitle,
  handleKeyDown,
  inputRef,
  localTitle,
  cancelEdit,
}) => (
  <Form.Group onBlur={(e) => updateTitle(e)}>
    <Form.Control
      style={{ paddingInlineEnd: 'calc(1rem + 84px)' }}
      autoFocus
      trailingElement={<EditConfirmationButtons {...{ updateTitle, cancelEdit }} />}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Title"
      ref={inputRef}
      value={localTitle}
    />
  </Form.Group>
);
EditableHeader.defaultProps = {
  inputRef: null,
};
EditableHeader.propTypes = {
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  handleChange: PropTypes.func.isRequired,
  updateTitle: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  localTitle: PropTypes.string.isRequired,
  cancelEdit: PropTypes.func.isRequired,
};

export const EditableHeaderInternal = EditableHeader; // For testing only
export default EditableHeader;

import React from 'react';
import PropTypes from 'prop-types';

import { Icon, Form } from '@edx/paragon';
import { Edit } from '@edx/paragon/icons';

export const EditableHeader = ({
  handleChange,
  updateTitle,
  handleKeyDown,
  inputRef,
  localTitle,
}) => (
  <Form.Group>
    <Form.Control
      autoFocus
      onBlur={updateTitle}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Title"
      ref={inputRef}
      trailingElement={<Icon src={Edit} />}
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
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  handleChange: PropTypes.func.isRequired,
  updateTitle: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  localTitle: PropTypes.string.isRequired,
};

export default EditableHeader;

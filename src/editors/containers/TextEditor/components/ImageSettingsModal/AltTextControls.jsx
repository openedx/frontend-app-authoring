import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';

import * as hooks from './hooks';

/**
 * Wrapper for alt-text input and isDecorative checkbox control
 * @param {bool} isDecorative - is the image decorative?
 * @param {func} setIsDecorative - handle isDecorative change event
 * @param {func} setValue - update alt-text value
 * @param {string} value - current alt-text value
 */
export const AltTextControls = ({
  isDecorative,
  setIsDecorative,
  setValue,
  value,
}) => (
  <Form.Group className="mt-4.5">
    <Form.Label as="h4">Accessibility</Form.Label>
    <Form.Control
      className="mt-4.5"
      type="input"
      value={value}
      disabled={isDecorative}
      onChange={hooks.onInputChange(setValue)}
      floatingLabel="Alt Text"
    />
    <Form.Checkbox
      className="mt-4.5 decorative-control-label"
      checked={isDecorative}
      onChange={hooks.onCheckboxChange(setIsDecorative)}
    >
      <Form.Label>
        This image is decorative (no alt text required).
      </Form.Label>
    </Form.Checkbox>
  </Form.Group>
);
AltTextControls.propTypes = {
  isDecorative: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  setIsDecorative: PropTypes.func.isRequired,
};

export default AltTextControls;

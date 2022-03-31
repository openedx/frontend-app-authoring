import React from 'react';
import PropTypes from 'prop-types';

import { Form } from '@edx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import * as hooks from './hooks';
import messages from './messages';

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
  // inject
  intl,
}) => (
  <Form.Group className="mt-4.5">
    <Form.Label as="h4">
      <FormattedMessage {...messages.accessibilityLabel} />
    </Form.Label>
    <Form.Control
      className="mt-4.5"
      type="input"
      value={value}
      disabled={isDecorative}
      onChange={hooks.onInputChange(setValue)}
      floatingLabel={intl.formatMessage(messages.altTextFloatingLabel)}
    />
    <Form.Checkbox
      className="mt-4.5 decorative-control-label"
      checked={isDecorative}
      onChange={hooks.onCheckboxChange(setIsDecorative)}
    >
      <Form.Label>
        <FormattedMessage {...messages.decorativeCheckboxLabel} />
      </Form.Label>
    </Form.Checkbox>
  </Form.Group>
);
AltTextControls.propTypes = {
  isDecorative: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  setIsDecorative: PropTypes.func.isRequired,
  // inject
  intl: intlShape.isRequired,
};

export default injectIntl(AltTextControls);

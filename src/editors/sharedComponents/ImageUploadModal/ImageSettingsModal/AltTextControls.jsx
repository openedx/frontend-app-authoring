import React from 'react';
import PropTypes from 'prop-types';

import { Form } from '@openedx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import * as hooks from './hooks';
import messages from './messages';

/**
 * Wrapper for alt-text input and isDecorative checkbox control
 * @param {obj} errorProps - props for error handling
 *   {bool} isValid - are alt-text fields valid for saving?
 * @param {bool} isDecorative - is the image decorative?
 * @param {func} setIsDecorative - handle isDecorative change event
 * @param {func} setValue - update alt-text value
 * @param {string} value - current alt-text value
 */
const AltTextControls = ({
  isDecorative,
  setIsDecorative,
  setValue,
  validation,
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
      disabled={isDecorative}
      floatingLabel={intl.formatMessage(messages.altTextFloatingLabel)}
      isInvalid={validation.show}
      onChange={hooks.onInputChange(setValue)}
      type="input"
      value={value}
    />
    {validation.show
      && (
        <Form.Control.Feedback type="invalid">
          <FormattedMessage {...messages.altTextLocalFeedback} />
        </Form.Control.Feedback>
      )}
    <Form.Checkbox
      checked={isDecorative}
      className="mt-4.5 decorative-control-label"
      onChange={hooks.onCheckboxChange(setIsDecorative)}
    >
      <Form.Label>
        <FormattedMessage {...messages.decorativeAltTextCheckboxLabel} />
      </Form.Label>
    </Form.Checkbox>
  </Form.Group>
);
AltTextControls.propTypes = {
  error: PropTypes.shape({
    show: PropTypes.bool,
  }).isRequired,
  isDecorative: PropTypes.bool.isRequired,
  setValue: PropTypes.func.isRequired,
  setIsDecorative: PropTypes.func.isRequired,
  validation: PropTypes.shape({
    show: PropTypes.bool,
  }).isRequired,
  value: PropTypes.string.isRequired,
  // inject
  intl: intlShape.isRequired,
};

export const AltTextControlsInternal = AltTextControls; // For testing only
export default injectIntl(AltTextControls);

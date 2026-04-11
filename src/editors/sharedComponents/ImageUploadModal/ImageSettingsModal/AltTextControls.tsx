import { useFormikContext } from 'formik';
import React from 'react';

import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ImageConfig } from './types';

import messages from './messages';

const AltTextControls = () => {
  const intl = useIntl();
  const formik = useFormikContext<ImageConfig>();
  return (
    <>
      <Form.Group className="mt-1.5">
        <Form.Label>
          {intl.formatMessage(messages.accessibilityLabel)}
        </Form.Label>
        <Form.Control
          name="altText"
          className="mt-1.5"
          floatingLabel={intl.formatMessage(messages.altTextFloatingLabel)}
          disabled={formik.values.isDecorative}
          isInvalid={Boolean(formik.errors.altText)}
          onChange={formik.handleChange}
          type="input"
          value={formik.values.altText}
        />
        {formik.errors.altText && (
        <Form.Control.Feedback type="invalid">
          {formik.errors.altText}
        </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group>
        <Form.Checkbox
          name="isDecorative"
          checked={formik.values.isDecorative}
          className="mt-2.5 decorative-control-label"
          onChange={formik.handleChange}
        >
          <Form.Label>
            {intl.formatMessage(messages.decorativeAltTextCheckboxLabel)}
          </Form.Label>
        </Form.Checkbox>
      </Form.Group>
    </>
  );
};

export const AltTextControlsInternal = AltTextControls; // For testing only
export default AltTextControls;

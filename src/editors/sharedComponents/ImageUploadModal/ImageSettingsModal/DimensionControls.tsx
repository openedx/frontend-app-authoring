import { useFormikContext } from 'formik';
import React from 'react';
import {
  Form,
  Icon,
  IconButton,
} from '@openedx/paragon';
import {
  Locked,
  Unlocked,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ImageConfig, OrigImageDimensions,
} from './types';

import messages from './messages';

/**
 * Wrapper for image dimension inputs and the lock checkbox.
 * @param {ImageDimensions} originalDimensions - original dimensions of the image
 */
const DimensionControls = ({ originalDimensions }: { originalDimensions: OrigImageDimensions }) => {
  const { width: originalWidth, height: originalHeight } = originalDimensions;
  const intl = useIntl();
  const formik = useFormikContext<ImageConfig>();
  if (!(originalWidth && originalHeight)) {
    return null;
  }
  const handleUpdateDimensions = async ({ target }) => {
    const { name } = target;
    let { value } = target;
    // If dimensions are locked just set the value and return.
    await formik.setFieldValue(name, value);
    if (!formik.values.isLocked) {
      return;
    }
    // For percentages, both values need to be ratio is locked
    if (value.trim().endsWith('%')) {
      await formik.setFieldValue('width', value);
      await formik.setFieldValue('height', value);
      return;
    }
    if (!value) {
      return;
    }
    // For numerical values we calculate the other dimension based on the original ratio.
    value = parseInt(value, 10);
    if (name === 'height') {
      await formik.setFieldValue('width', Math.round((value / originalHeight) * originalWidth));
    } else if (name === 'width') {
      await formik.setFieldValue('height', Math.round((value / originalWidth) * originalHeight));
    }
  };
  return (
    <>
      <Form.Label>
        {intl.formatMessage(messages.imageDimensionsLabel)}
      </Form.Label>
      <div className="mb-4.5 d-flex">
        <Form.Group>
          <Form.Control
            name="width"
            className="dimension-input"
            value={formik.values.width}
            onChange={handleUpdateDimensions}
            onBlur={formik.handleBlur}
            floatingLabel={intl.formatMessage(messages.widthFloatingLabel)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Control
            name="height"
            className="dimension-input"
            value={formik.values.height}
            onChange={handleUpdateDimensions}
            onBlur={formik.handleBlur}
            floatingLabel={intl.formatMessage(messages.heightFloatingLabel)}
          />
        </Form.Group>
        <IconButton
          name="isLocked"
          className="d-inline-block"
          alt={
            formik.values.isLocked
              ? intl.formatMessage(messages.unlockDimensionsLabel)
              : intl.formatMessage(messages.lockDimensionsLabel)
        }
          iconAs={Icon}
          src={formik.values.isLocked ? Locked : Unlocked}
          onClick={() => formik.setFieldValue('isLocked', !formik.values.isLocked)}
        />
      </div>
    </>
  );
};

export default DimensionControls;

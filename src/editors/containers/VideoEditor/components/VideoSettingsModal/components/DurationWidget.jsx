import React from 'react';
import { useDispatch } from 'react-redux';

import {
  Col,
  Form,
  Row,
} from '@edx/paragon';

import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { keyStore } from '../../../../../utils';
import CollapsibleFormWidget from './CollapsibleFormWidget';
import hooks from './hooks';
import { durationFromValue } from './duration';
import messages from './messages';

/**
 * Collapsible Form widget controlling video start and end times
 * Also displays the total run time of the video.
 */
export const DurationWidget = ({
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const { duration } = hooks.widgetValues({
    dispatch,
    fields: { [hooks.selectorKeys.duration]: hooks.durationWidget },
  });
  const timeKeys = keyStore(duration.formValue);

  const getTotalLabel = (startTime, stopTime, subtitle) => {
    if (!stopTime) {
      if (!startTime) {
        return intl.formatMessage(messages.fullVideoLength);
      }
      if (subtitle) {
        return intl.formatMessage(messages.startsAt, { startTime: durationFromValue(startTime) });
      }
      return null;
    }
    const total = stopTime - (startTime || 0);
    return intl.formatMessage(messages.total, { total: durationFromValue(total) });
  };

  return (
    <CollapsibleFormWidget
      title={intl.formatMessage(messages.durationTitle)}
      subtitle={getTotalLabel(duration.formValue.startTime, duration.formValue.stopTime, true)}
    >
      <FormattedMessage {...messages.durationDescription} />
      <Row className="mt-4">
        <Form.Group as={Col}>
          <Form.Control
            floatingLabel={intl.formatMessage(messages.startTimeLabel)}
            value={duration.local.startTime}
            onBlur={duration.onBlur(timeKeys.startTime)}
            onChange={duration.onChange(timeKeys.startTime)}
          />
          <Form.Control.Feedback>
            <FormattedMessage {...messages.durationHint} />
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col}>
          <Form.Control
            floatingLabel={intl.formatMessage(messages.stopTimeLabel)}
            value={duration.local.stopTime}
            onBlur={duration.onBlur(timeKeys.stopTime)}
            onChange={duration.onChange(timeKeys.stopTime)}
          />
          <Form.Control.Feedback>
            <FormattedMessage {...messages.durationHint} />
          </Form.Control.Feedback>
        </Form.Group>
      </Row>
      <div className="mt-4">
        {getTotalLabel(duration.formValue.startTime, duration.formValue.stopTime)}
      </div>
    </CollapsibleFormWidget>
  );
};

DurationWidget.propTypes = {
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(DurationWidget);

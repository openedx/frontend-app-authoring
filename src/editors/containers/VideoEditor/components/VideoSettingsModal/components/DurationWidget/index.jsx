import React from 'react';
import { useDispatch } from 'react-redux';

import { Col, Form } from '@edx/paragon';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';

import { keyStore } from '../../../../../../utils';
import CollapsibleFormWidget from '../CollapsibleFormWidget';
import hooks from './hooks';
import messages from '../messages';

/**
 * Collapsible Form widget controlling video start and end times
 * Also displays the total run time of the video.
 */
export const DurationWidget = ({
  // injected
  intl,
}) => {
  const dispatch = useDispatch();

  const {
    reduxStartStopTimes,
    unsavedStartStopTimes,
    onBlur,
    onChange,
    onKeyDown,
    getTotalLabel,
  } = hooks.durationWidget({ dispatch });

  const timeKeys = keyStore(reduxStartStopTimes);

  return (
    <CollapsibleFormWidget
      fontSize="x-small"
      title={intl.formatMessage(messages.durationTitle)}
      subtitle={getTotalLabel({
        duration: reduxStartStopTimes,
        subtitle: true,
        intl,
      })}
    >
      <FormattedMessage {...messages.durationDescription} />
      <Form.Row className="mt-4.5">
        <Form.Group as={Col}>
          <Form.Control
            floatingLabel={intl.formatMessage(messages.startTimeLabel)}
            onBlur={onBlur(timeKeys.startTime)}
            onChange={onChange(timeKeys.startTime)}
            onKeyDown={onKeyDown(timeKeys.startTime)}
            value={unsavedStartStopTimes.startTime}
          />
          <Form.Control.Feedback>
            <FormattedMessage {...messages.durationHint} />
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col}>
          <Form.Control
            floatingLabel={intl.formatMessage(messages.stopTimeLabel)}
            onBlur={onBlur(timeKeys.stopTime)}
            onChange={onChange(timeKeys.stopTime)}
            onKeyDown={onKeyDown(timeKeys.stopTime)}
            value={unsavedStartStopTimes.stopTime}
          />
          <Form.Control.Feedback>
            <FormattedMessage {...messages.durationHint} />
          </Form.Control.Feedback>
        </Form.Group>
      </Form.Row>
      <div className="mt-4">
        {getTotalLabel({
          duration: reduxStartStopTimes,
          subtitle: false,
          intl,
        })}
      </div>
    </CollapsibleFormWidget>
  );
};

DurationWidget.propTypes = {
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(DurationWidget);

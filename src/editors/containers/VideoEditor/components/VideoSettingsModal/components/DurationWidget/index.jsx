import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Col, Form } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { actions, selectors } from '../../../../../../data/redux';
import { keyStore } from '../../../../../../utils';
import CollapsibleFormWidget from '../CollapsibleFormWidget';
import * as hooks from './hooks';
import messages from '../messages';

import './index.scss';

/**
 * Collapsible Form widget controlling video start and end times
 * Also displays the total run time of the video.
 */
const DurationWidget = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const duration = useSelector(selectors.video.duration);

  const updateField = (payload) => dispatch(actions.video.updateField(payload));

  const {
    unsavedDuration,
    onBlur,
    onChange,
    onKeyDown,
    getTotalLabel,
  } = hooks.durationWidget({ duration, updateField });

  const timeKeys = keyStore(duration);

  return (
    <CollapsibleFormWidget
      fontSize="x-small"
      title={intl.formatMessage(messages.durationTitle)}
      subtitle={getTotalLabel({
        durationString: duration,
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
            value={unsavedDuration.startTime}
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
            value={unsavedDuration.stopTime}
          />
          <Form.Control.Feedback>
            <FormattedMessage {...messages.durationHint} />
          </Form.Control.Feedback>
        </Form.Group>
      </Form.Row>
      <div className="mt-4 mx-2 text-right">
        <span className="p-2 total-label rounded">
          {getTotalLabel({
            durationString: duration,
            subtitle: false,
            intl,
          })}
        </span>
      </div>
    </CollapsibleFormWidget>
  );
};

// For testing
export const DurationWidgetInternal = DurationWidget;

export default DurationWidget;

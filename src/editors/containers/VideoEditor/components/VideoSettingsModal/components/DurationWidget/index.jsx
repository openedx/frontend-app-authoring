import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Col, Form } from '@openedx/paragon';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';

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
const DurationWidget = ({
  // redux
  duration,
  updateField,
  // injected
  intl,
}) => {
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

DurationWidget.propTypes = {
  // redux
  duration: PropTypes.objectOf(PropTypes.number).isRequired,
  updateField: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export const mapStateToProps = (state) => ({
  duration: selectors.video.duration(state),
});

export const mapDispatchToProps = {
  updateField: actions.video.updateField,
};

export const DurationWidgetInternal = DurationWidget; // For testing only
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(DurationWidget));

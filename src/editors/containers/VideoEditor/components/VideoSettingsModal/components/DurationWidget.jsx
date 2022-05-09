import React from 'react';
import { useDispatch } from 'react-redux';
// import PropTypes from 'prop-types';

import {
  FormControl,
  FormGroup,
} from '@edx/paragon';

import { keyStore } from '../../../../../utils';
import CollapsibleFormWidget from './CollapsibleFormWidget';
import hooks from './hooks';

/**
 * Collapsible Form widget controlling video start and end times
 * Also displays the total run time of the video.
 */
export const DurationWidget = () => {
  const dispatch = useDispatch();
  const { duration } = hooks.widgetValues({
    dispatch,
    fields: { [hooks.selectorKeys.duration]: hooks.durationWidget },
  });
  const timeKeys = keyStore(duration.formValue);
  return (
    <CollapsibleFormWidget title="Duration">
      <FormGroup size="sm">
        <div>
          <FormControl
            className="d-inline-block"
            floatingLabel="Start time"
            value={duration.local.startTime}
            onBlur={duration.onBlur(timeKeys.startTime)}
            onChange={duration.onChange(timeKeys.startTime)}
          />
          <FormControl
            className="d-inline-block"
            floatingLabel="Stop time"
            value={duration.local.stopTime}
            onBlur={duration.onBlur(timeKeys.stopTime)}
            onChange={duration.onChange(timeKeys.stopTime)}
          />
        </div>
        <div className="mt-4">
          Total: {duration.formValue.total}
        </div>
      </FormGroup>
    </CollapsibleFormWidget>
  );
};

export default DurationWidget;

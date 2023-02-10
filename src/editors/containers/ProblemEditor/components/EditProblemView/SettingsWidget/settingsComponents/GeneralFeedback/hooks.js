import { useState, useEffect } from 'react';
import _ from 'lodash-es';
import messages from './messages';
import * as module from './hooks';

export const state = {
  summary: (val) => useState(val),
};

export const generalFeedbackHooks = (generalFeedback, updateSettings) => {
  const [summary, setSummary] = module.state.summary({
    message: messages.noGeneralFeedbackSummary, values: {}, intl: true,
  });

  useEffect(() => {
    if (_.isEmpty(generalFeedback)) {
      setSummary({ message: messages.noGeneralFeedbackSummary, values: {}, intl: true });
    } else {
      setSummary({
        message: generalFeedback,
        values: {},
        intl: false,
      });
    }
  }, [generalFeedback]);

  const handleChange = (event) => {
    updateSettings({ generalFeedback: event.target.value });
  };

  return {
    summary,
    handleChange,
  };
};

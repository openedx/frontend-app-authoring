import { useState, useEffect } from 'react';
import messages from './messages';
import { RandomizationTypes } from '../../../../../../../data/constants/problem';
import * as module from './hooks';

export const state = {
  summary: (val) => useState(val),
};

export const useRandomizationSettingStatus = ({ randomization, updateSettings }) => {
  const [summary, setSummary] = module.state.summary({ message: messages.noRandomizationSummary, values: {} });
  useEffect(() => {
    setSummary({
      message: randomization ? RandomizationTypes[randomization] : messages.noRandomizationSummary,
    });
  }, [randomization]);

  const handleChange = (event) => {
    updateSettings({ randomization: event.target.value });
  };
  return { summary, handleChange };
};

export default useRandomizationSettingStatus;

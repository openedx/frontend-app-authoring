import { useState, useEffect } from 'react';
import { RandomizationTypes, RandomizationTypesKeys } from '../../../../../../../data/constants/problem';
import * as module from './hooks';

export const state = {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  summary: (val) => useState(val),
};

export const useRandomizationSettingStatus = ({ randomization, updateSettings }) => {
  const [summary, setSummary] = module.state.summary({
    message: RandomizationTypes[RandomizationTypesKeys.NEVER],
    values: {},
  });
  useEffect(() => {
    setSummary({
      message: randomization ? RandomizationTypes[randomization] : RandomizationTypes[RandomizationTypesKeys.NEVER],
    });
  }, [randomization]);

  const handleChange = (event) => {
    updateSettings({ randomization: event.target.value });
  };
  return { summary, handleChange };
};

export default useRandomizationSettingStatus;

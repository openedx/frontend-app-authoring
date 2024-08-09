import { useState, useEffect } from 'react';
import { RandomizationTypes, RandomizationTypesKeys } from '../../../../../../../data/constants/problem';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
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

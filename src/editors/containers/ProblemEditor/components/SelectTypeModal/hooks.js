import { useEffect, useState } from 'react';
import {
  AdvanceProblemKeys, AdvanceProblems, ProblemTypeKeys, ProblemTypes,
} from '../../../../data/constants/problem';
import { StrictDict, snakeCaseKeys } from '../../../../utils';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';
import { getDataFromOlx } from '../../../../data/redux/thunkActions/problem';

export const state = StrictDict({
  // eslint-disable-next-line react-hooks/rules-of-hooks
  selected: (val) => useState(val),
});

export const selectHooks = () => {
  const [selected, setSelected] = module.state.selected(ProblemTypeKeys.SINGLESELECT);
  return {
    selected,
    setSelected,
  };
};

export const onSelect = ({
  selected,
  updateField,
  setBlockTitle,
  defaultSettings,
}) => () => {
  if (Object.values(AdvanceProblemKeys).includes(selected)) {
    updateField({ problemType: ProblemTypeKeys.ADVANCED, rawOLX: AdvanceProblems[selected].template });
    setBlockTitle(AdvanceProblems[selected].title);
  } else {
    const newOLX = ProblemTypes[selected].template;
    const newState = getDataFromOlx({
      rawOLX: newOLX,
      rawSettings: {
        weight: 1,
        attempts_before_showanswer_button: 0,
        show_reset_button: null,
        showanswer: null,
        defaultToAdvanced: false,
      },
      defaultSettings: snakeCaseKeys(defaultSettings),
    });
    updateField(newState);
    setBlockTitle(ProblemTypes[selected].title);
  }
};

export const useArrowNav = (selected, setSelected) => {
  const detectKeyDown = (e) => {
    const problemTypeValues = Object.values(ProblemTypeKeys);
    switch (e.key) {
      case 'ArrowUp':
        if (problemTypeValues.includes(selected) && ProblemTypes[selected].prev) {
          setSelected(ProblemTypes[selected].prev);
          document.getElementById(ProblemTypes[selected].prev).focus();
        }
        break;
      case 'ArrowDown':
        if (problemTypeValues.includes(selected) && ProblemTypes[selected].next) {
          setSelected(ProblemTypes[selected].next);
          document.getElementById(ProblemTypes[selected].next).focus();
        }
        break;
      default:
    }
  };
  useEffect(() => {
    document.addEventListener('keydown', detectKeyDown, true);
    return () => {
      document.removeEventListener('keydown', detectKeyDown, true);
    };
  }, [selected, setSelected]);
};

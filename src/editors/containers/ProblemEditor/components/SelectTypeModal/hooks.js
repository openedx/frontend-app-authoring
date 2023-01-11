import { useEffect, useState } from 'react';
import {
  AdvanceProblemKeys, AdvanceProblems, ProblemTypeKeys, ProblemTypes,
} from '../../../../data/constants/problem';
import { StrictDict } from '../../../../utils';
import * as module from './hooks';
import { getDataFromOlx } from '../../../../data/redux/thunkActions/problem';

export const state = StrictDict({
  selected: (val) => useState(val),
});

export const selectHooks = () => {
  const [selected, setSelected] = module.state.selected(ProblemTypeKeys.SINGLESELECT);
  return {
    selected,
    setSelected,
  };
};

export const onSelect = (selected, updateField) => () => {
  if (Object.values(AdvanceProblemKeys).includes(selected)) {
    updateField({ problemType: ProblemTypeKeys.ADVANCED, rawOLX: AdvanceProblems[selected] });
  } else {
    const newOLX = ProblemTypes[selected].template;
    const { settings, ...newState } = getDataFromOlx({ rawOLX: newOLX, rawSettings: {} });
    updateField({ ...newState });
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

export default {
  state,
  selectHooks,
  onSelect,
  useArrowNav,
};

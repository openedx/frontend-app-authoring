import { useEffect } from 'react';
import {
  AdvanceProblemKeys, AdvanceProblems, ProblemTypeKeys, ProblemTypes, getProblemTypes, getAdvanceProblems,
} from '@src/editors/data/constants/problem';
import { snakeCaseKeys } from '../../../../utils';
import { getDataFromOlx } from '../../../../data/redux/thunkActions/problem';

export const onSelect = ({
  selected,
  updateField,
  setBlockTitle,
  defaultSettings,
  formatMessage,
}) => () => {
  if (Object.values(AdvanceProblemKeys).includes(selected)) {
    updateField({ problemType: ProblemTypeKeys.ADVANCED, rawOLX: AdvanceProblems[selected].template });
    if (formatMessage) {
      const localizedAdvanceProblems = getAdvanceProblems(formatMessage);
      setBlockTitle(localizedAdvanceProblems[selected].title);
    } else {
      setBlockTitle(AdvanceProblems[selected].title);
    }
  } else {
    const newOLX = ProblemTypes[selected].template;
    const newMarkdown = ProblemTypes[selected].markdownTemplate;
    const newState = getDataFromOlx({
      rawOLX: newOLX,
      rawSettings: {
        weight: 1,
        attempts_before_showanswer_button: 0,
        show_reset_button: null,
        showanswer: null,
      },
      defaultSettings: snakeCaseKeys(defaultSettings),
    });
    updateField({ ...newState, rawMarkdown: newMarkdown });
    if (formatMessage) {
      const localizedProblemTypes = getProblemTypes(formatMessage);
      setBlockTitle(localizedProblemTypes[selected].title);
    } else {
      setBlockTitle(ProblemTypes[selected].title);
    }
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

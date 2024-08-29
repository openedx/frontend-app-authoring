import { useState, useEffect } from 'react';

import _ from 'lodash';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';
import messages from './messages';
import {
  ProblemTypeKeys,
  ProblemTypes,
  RichTextProblems,
  ShowAnswerTypesKeys,
} from '../../../../../data/constants/problem';
import { fetchEditorContent } from '../hooks';

export const state = {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  showAdvanced: (val) => useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  cardCollapsed: (val) => useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  summary: (val) => useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  showAttempts: (val) => useState(val),
  // eslint-disable-next-line react-hooks/rules-of-hooks
  attemptDisplayValue: (val) => useState(val),
};

export const showAdvancedSettingsCards = () => {
  const [isAdvancedCardsVisible, setIsAdvancedCardsVisible] = module.state.showAdvanced(false);
  return {
    isAdvancedCardsVisible,
    showAdvancedCards: () => setIsAdvancedCardsVisible(true),
  };
};

export const showFullCard = (hasExpandableTextArea) => {
  const [isCardCollapsibleOpen, setIsCardCollapsibleOpen] = module.state.cardCollapsed(hasExpandableTextArea);
  return {
    isCardCollapsibleOpen,
    toggleCardCollapse: () => {
      if (hasExpandableTextArea) {
        setIsCardCollapsibleOpen(true);
      } else {
        setIsCardCollapsibleOpen(!isCardCollapsibleOpen);
      }
    },
  };
};

export const hintsCardHooks = (hints, updateSettings) => {
  const [summary, setSummary] = module.state.summary({ message: messages.noHintSummary, values: {} });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const hintsNumber = hints.length;
    if (hintsNumber === 0) {
      setSummary({ message: messages.noHintSummary, values: {} });
    } else {
      setSummary({ message: messages.hintSummary, values: { hint: hints[0].value, count: (hintsNumber - 1) } });
    }
  }, [hints]);

  const handleAdd = () => {
    let newId = 0;
    if (!_.isEmpty(hints)) {
      newId = Math.max(...hints.map(hint => hint.id)) + 1;
    }
    const hint = { id: newId, value: '' };
    const modifiedHints = [...hints, hint];
    updateSettings({ hints: modifiedHints });
  };

  return {
    summary,
    handleAdd,
  };
};

export const hintsRowHooks = (id, hints, updateSettings) => {
  const handleChange = (value) => {
    const modifiedHints = hints.map(hint => {
      if (hint.id === id) {
        return { ...hint, value };
      }
      return hint;
    });
    updateSettings({ hints: modifiedHints });
  };

  const handleDelete = () => {
    const modifiedHints = hints.filter((hint) => (hint.id !== id));
    updateSettings({ hints: modifiedHints });
  };

  return {
    handleChange,
    handleDelete,
  };
};

export const resetCardHooks = (updateSettings) => {
  const setReset = (value) => {
    updateSettings({ showResetButton: value });
  };

  return {
    setResetTrue: () => setReset(true),
    setResetFalse: () => setReset(false),
  };
};

export const scoringCardHooks = (scoring, updateSettings, defaultValue) => {
  let loadedAttemptsNumber = scoring.attempts.number;
  if ((loadedAttemptsNumber === defaultValue || !_.isFinite(loadedAttemptsNumber)) && _.isFinite(defaultValue)) {
    loadedAttemptsNumber = `${defaultValue} (Default)`;
  } else if (loadedAttemptsNumber === defaultValue && _.isNil(defaultValue)) {
    loadedAttemptsNumber = '';
  }
  const [attemptDisplayValue, setAttemptDisplayValue] = module.state.attemptDisplayValue(loadedAttemptsNumber);

  const handleUnlimitedChange = (event) => {
    const isUnlimited = event.target.checked;
    if (isUnlimited) {
      setAttemptDisplayValue('');
      updateSettings({ scoring: { ...scoring, attempts: { number: null, unlimited: true } } });
    } else {
      updateSettings({ scoring: { ...scoring, attempts: { number: null, unlimited: false } } });
    }
  };

  const handleMaxAttemptChange = (event) => {
    let unlimitedAttempts = false;
    let attemptNumber = parseInt(event.target.value, 10);

    if (!_.isFinite(attemptNumber) || attemptNumber === defaultValue) {
      attemptNumber = null;
      if (_.isFinite(defaultValue)) {
        setAttemptDisplayValue(`${defaultValue} (Default)`);
      } else {
        setAttemptDisplayValue('');
        unlimitedAttempts = true;
      }
    } else if (attemptNumber <= 0) {
      attemptNumber = 0;
    }

    updateSettings({ scoring: { ...scoring, attempts: { number: attemptNumber, unlimited: unlimitedAttempts } } });
  };

  const handleOnChange = (event) => {
    let newMaxAttempt = parseInt(event.target.value, 10);
    if (newMaxAttempt === defaultValue) {
      newMaxAttempt = `${defaultValue} (Default)`;
    } else if (_.isNaN(newMaxAttempt)) {
      newMaxAttempt = '';
    } else if (newMaxAttempt < 0) {
      newMaxAttempt = 0;
    }
    setAttemptDisplayValue(newMaxAttempt);
  };

  const handleWeightChange = (event) => {
    let weight = parseFloat(event.target.value);
    if (_.isNaN(weight) || weight < 0) {
      weight = 0;
    }
    updateSettings({ scoring: { ...scoring, weight } });
  };

  return {
    attemptDisplayValue,
    handleUnlimitedChange,
    handleMaxAttemptChange,
    handleOnChange,
    handleWeightChange,
  };
};

export const useAnswerSettings = (showAnswer, updateSettings) => {
  const [showAttempts, setShowAttempts] = module.state.showAttempts(false);

  const numberOfAttemptsChoice = [
    ShowAnswerTypesKeys.AFTER_SOME_NUMBER_OF_ATTEMPTS,
  ];

  useEffect(() => {
    setShowAttempts(_.includes(numberOfAttemptsChoice, showAnswer.on));
  }, [showAttempts]);

  const handleShowAnswerChange = (event) => {
    const { value } = event.target;
    setShowAttempts(_.includes(numberOfAttemptsChoice, value));
    updateSettings({ showAnswer: { ...showAnswer, on: value } });
  };

  const handleAttemptsChange = (event) => {
    let attempts = parseInt(event.target.value, 10);
    if (_.isNaN(attempts) || attempts < 0) {
      attempts = 0;
    }
    updateSettings({ showAnswer: { ...showAnswer, afterAttempts: attempts } });
  };

  return {
    handleShowAnswerChange,
    handleAttemptsChange,
    showAttempts,
  };
};

export const timerCardHooks = (updateSettings) => ({
  handleChange: (event) => {
    let time = parseInt(event.target.value, 10);
    if (_.isNaN(time) || time < 0) {
      time = 0;
    }
    updateSettings({ timeBetween: time });
  },
});

export const typeRowHooks = ({
  answers,
  blockTitle,
  correctAnswerCount,
  problemType,
  setBlockTitle,
  typeKey,
  updateField,
  updateAnswer,
}) => {
  const clearPreviouslySelectedAnswers = () => {
    let currentAnswerTitles;
    const { selectedFeedback, unselectedFeedback, ...editorContent } = fetchEditorContent({ format: 'text' });
    if (RichTextProblems.includes(problemType)) {
      currentAnswerTitles = editorContent.answers;
    }
    answers.forEach(answer => {
      const title = currentAnswerTitles?.[answer.id] || answer.title;
      if (answer.correct) {
        updateAnswer({
          ...answer,
          title,
          selectedFeedback,
          unselectedFeedback,
          correct: false,
        });
      } else {
        updateAnswer({
          ...answer,
          selectedFeedback,
          unselectedFeedback,
          title,
        });
      }
    });
  };

  const updateAnswersToCorrect = () => {
    let currentAnswerTitles;
    const { selectedFeedback, unselectedFeedback, ...editorContent } = fetchEditorContent({ format: 'text' });
    if (RichTextProblems.includes(problemType)) {
      currentAnswerTitles = editorContent.answers;
    }
    answers.forEach(answer => {
      const title = currentAnswerTitles ? currentAnswerTitles[answer.id] : answer.title;
      updateAnswer({
        ...answer,
        title,
        selectedFeedback,
        unselectedFeedback,
        correct: true,
      });
    });
  };

  const convertToPlainText = () => {
    const { selectedFeedback, unselectedFeedback, ...editorContent } = fetchEditorContent({ format: 'text' });
    const currentAnswerTitles = editorContent.answers;
    answers.forEach(answer => {
      updateAnswer({
        ...answer,
        selectedFeedback,
        unselectedFeedback,
        title: currentAnswerTitles[answer.id],
      });
    });
  };

  const onClick = () => {
    // Numeric, text, and dropdowns cannot render HTML as answer values, so if switching from a single select
    // or multi-select problem the rich text needs to covert to plain text
    if (typeKey === ProblemTypeKeys.TEXTINPUT && RichTextProblems.includes(problemType)) {
      convertToPlainText();
    }
    // Dropdown problems can only have one correct answer. When there is more than one correct answer
    // from a previous problem type, the correct attribute for selected answers need to be set to false.
    if (typeKey === ProblemTypeKeys.DROPDOWN) {
      if (correctAnswerCount > 1) {
        clearPreviouslySelectedAnswers();
      } else if (RichTextProblems.includes(problemType)) {
        convertToPlainText();
      }
    }
    // Numeric input problems can only have correct answers. Switch all answers to correct when switching
    // to numeric input.
    if (typeKey === ProblemTypeKeys.NUMERIC) {
      updateAnswersToCorrect();
    }

    if (blockTitle === ProblemTypes[problemType].title) {
      setBlockTitle(ProblemTypes[typeKey].title);
    }
    updateField({ problemType: typeKey });
  };
  return {
    onClick,
  };
};

export const confirmSwitchToAdvancedEditor = ({
  switchToAdvancedEditor,
  setConfirmOpen,
}) => {
  switchToAdvancedEditor();
  setConfirmOpen(false);
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

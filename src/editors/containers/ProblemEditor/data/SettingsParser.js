import {
  get, isEmpty, isFinite, isNil,
} from 'lodash';

import { ShowAnswerTypes, RandomizationTypesKeys } from '../../../data/constants/problem';

export const popuplateItem = (parentObject, itemName, statekey, metadata, defaultValue = null, allowNull = false) => {
  let parent = parentObject;
  const item = get(metadata, itemName, null);

  // if item is null, undefined, or empty string, use defaultValue
  const finalValue = (isNil(item) || item === '') ? defaultValue : item;

  if (!isNil(finalValue) || allowNull) {
    parent = { ...parentObject, [statekey]: finalValue };
  }
  return parent;
};

export const parseScoringSettings = (metadata, defaultSettings) => {
  let scoring = {};

  const attempts = popuplateItem({}, 'max_attempts', 'number', metadata);
  const initialAttempts = get(attempts, 'number', null);
  const defaultAttempts = get(defaultSettings, 'max_attempts', null);
  attempts.unlimited = false;

  // isFinite checks if value is a finite primitive number.
  if (!isFinite(initialAttempts) || initialAttempts === defaultAttempts) {
    // set number to null in any case as lms will pick default value if it exists.
    attempts.number = null;
  }

  // if both block number and default number are null set unlimited to true.
  if (isNil(initialAttempts) && isNil(defaultAttempts)) {
    attempts.unlimited = true;
  }

  if (attempts.number < 0) {
    attempts.number = 0;
  }

  scoring = { ...scoring, attempts };

  scoring = popuplateItem(scoring, 'weight', 'weight', metadata);

  return scoring;
};

export const parseShowAnswer = (metadata) => {
  let showAnswer = {};

  const showAnswerType = get(metadata, 'showanswer', {});
  if (!isNil(showAnswerType) && showAnswerType in ShowAnswerTypes) {
    showAnswer = { ...showAnswer, on: showAnswerType };
  }

  showAnswer = popuplateItem(showAnswer, 'attempts_before_showanswer_button', 'afterAttempts', metadata);

  return showAnswer;
};

export const parseSettings = (metadata, defaultSettings) => {
  let settings = {};

  if (isNil(metadata) || isEmpty(metadata)) {
    return settings;
  }

  const scoring = parseScoringSettings(metadata, defaultSettings);
  if (!isEmpty(scoring)) {
    settings = { ...settings, scoring };
  }

  const showAnswer = parseShowAnswer(metadata);
  if (!isEmpty(showAnswer)) {
    settings = { ...settings, showAnswer };
  }

  const randomizationType = get(metadata, 'rerandomize', {});
  if (!isEmpty(randomizationType) && Object.values(RandomizationTypesKeys).includes(randomizationType)) {
    settings = popuplateItem(settings, 'rerandomize', 'randomization', metadata);
  }

  settings = popuplateItem(settings, 'show_reset_button', 'showResetButton', metadata);
  settings = popuplateItem(settings, 'submission_wait_seconds', 'timeBetween', metadata);
  return settings;
};

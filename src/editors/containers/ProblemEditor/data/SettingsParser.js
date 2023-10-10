import _ from 'lodash-es';

import { ShowAnswerTypes, RandomizationTypesKeys } from '../../../data/constants/problem';

export const popuplateItem = (parentObject, itemName, statekey, metadata, allowNull = false) => {
  let parent = parentObject;
  const item = _.get(metadata, itemName, null);
  if (!_.isNil(item) || allowNull) {
    parent = { ...parentObject, [statekey]: item };
  }
  return parent;
};

export const parseScoringSettings = (metadata, defaultSettings) => {
  let scoring = {};

  const attempts = popuplateItem({}, 'max_attempts', 'number', metadata);
  attempts.unlimited = false;

  // isFinite checks if value is a finite primitive number.
  if (!_.isFinite(_.get(attempts, 'number', null))) {
    attempts.number = _.get(defaultSettings, 'max_attempts', null);
  }

  // if above statement was true and no default was found, set unlimited to true
  if (_.isNil(attempts.number)) {
    attempts.number = '';
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

  const showAnswerType = _.get(metadata, 'showanswer', {});
  if (!_.isNil(showAnswerType) && showAnswerType in ShowAnswerTypes) {
    showAnswer = { ...showAnswer, on: showAnswerType };
  }

  showAnswer = popuplateItem(showAnswer, 'attempts_before_showanswer_button', 'afterAttempts', metadata);

  return showAnswer;
};

export const parseSettings = (metadata, defaultSettings) => {
  let settings = {};

  if (_.isNil(metadata) || _.isEmpty(metadata)) {
    return settings;
  }

  const scoring = parseScoringSettings(metadata, defaultSettings);
  if (!_.isEmpty(scoring)) {
    settings = { ...settings, scoring };
  }

  const showAnswer = parseShowAnswer(metadata);
  if (!_.isEmpty(showAnswer)) {
    settings = { ...settings, showAnswer };
  }

  const randomizationType = _.get(metadata, 'rerandomize', {});
  if (!_.isEmpty(randomizationType) && Object.values(RandomizationTypesKeys).includes(randomizationType)) {
    settings = popuplateItem(settings, 'rerandomize', 'randomization', metadata);
  }

  settings = popuplateItem(settings, 'show_reset_button', 'showResetButton', metadata);
  settings = popuplateItem(settings, 'submission_wait_seconds', 'timeBetween', metadata);
  return settings;
};

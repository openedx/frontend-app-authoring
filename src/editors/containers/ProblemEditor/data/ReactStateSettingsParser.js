import { XMLParser } from 'fast-xml-parser';
import _ from 'lodash';

import {
  ShowAnswerTypesKeys,
} from '../../../data/constants/problem';
import { popuplateItem } from './SettingsParser';

const SETTING_KEYS = [
  'max_attempts',
  'weight',
  'showanswer',
  'show_reset_button',
  'rerandomize',
];

class ReactStateSettingsParser {
  constructor(problemState) {
    this.problem = problemState.problem;
    this.rawOLX = problemState.rawOLX;
  }

  getSettings() {
    let settings = {};
    const { defaultSettings } = this.problem;
    const stateSettings = this.problem.settings;

    const numberOfAttemptsChoice = [
      ShowAnswerTypesKeys.AFTER_SOME_NUMBER_OF_ATTEMPTS,
      ShowAnswerTypesKeys.AFTER_ALL_ATTEMPTS,
      ShowAnswerTypesKeys.AFTER_ALL_ATTEMPTS_OR_CORRECT,
    ];

    settings = popuplateItem(settings, 'number', 'max_attempts', stateSettings.scoring.attempts, defaultSettings?.maxAttempts, true);
    settings = popuplateItem(settings, 'weight', 'weight', stateSettings.scoring);
    settings = popuplateItem(settings, 'on', 'showanswer', stateSettings.showAnswer, defaultSettings?.showanswer);
    if (_.includes(numberOfAttemptsChoice, stateSettings.showAnswer.on)) {
      settings = popuplateItem(settings, 'afterAttempts', 'attempts_before_showanswer_button', stateSettings.showAnswer);
    }
    settings = popuplateItem(settings, 'showResetButton', 'show_reset_button', stateSettings, defaultSettings?.showResetButton);
    settings = popuplateItem(settings, 'timeBetween', 'submission_wait_seconds', stateSettings);
    settings = popuplateItem(settings, 'randomization', 'rerandomize', stateSettings, defaultSettings?.rerandomize);

    return settings;
  }

  parseRawOlxSettings() {
    const rawOlxSettings = this.getSettings();
    const parserOptions = {
      ignoreAttributes: false,
      alwaysCreateTextNode: true,
      numberParseOptions: {
        leadingZeros: false,
        hex: false,
      },
    };
    const parser = new XMLParser(parserOptions);
    const olx = parser.parse(this.rawOLX);
    const settingAttributes = Object.keys(olx.problem).filter(tag => tag.startsWith('@_'));
    settingAttributes.forEach(attribute => {
      const attributeKey = attribute.substring(2);
      if (SETTING_KEYS.includes(attributeKey)) {
        if (attributeKey === 'max_attempts' || attributeKey === 'weight') {
          rawOlxSettings[attributeKey] = parseInt(olx.problem[attribute], 10);
        } else {
          rawOlxSettings[attributeKey] = olx.problem[attribute];
        }
      }
    });
    return rawOlxSettings;
  }
}

export default ReactStateSettingsParser;

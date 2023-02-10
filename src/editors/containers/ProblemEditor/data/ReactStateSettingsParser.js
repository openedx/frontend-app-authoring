import { popuplateItem } from './SettingsParser';

class ReactStateSettingsParser {
  constructor(problemState) {
    this.problemState = problemState;
  }

  getSettings() {
    let settings = {};
    const stateSettings = this.problemState.settings;

    settings = popuplateItem(settings, 'matLabApiKey', 'matlab_api_key', stateSettings);
    settings = popuplateItem(settings, 'number', 'max_attempts', stateSettings.scoring.attempts);
    settings = popuplateItem(settings, 'weight', 'weight', stateSettings.scoring);
    settings = popuplateItem(settings, 'on', 'showanswer', stateSettings.showAnswer);
    settings = popuplateItem(settings, 'afterAttempts', 'attempts_before_showanswer_button', stateSettings.showAnswer);
    settings = popuplateItem(settings, 'showResetButton', 'show_reset_button', stateSettings);
    settings = popuplateItem(settings, 'timeBetween', 'submission_wait_seconds', stateSettings);
    settings = popuplateItem(settings, 'randomization', 'rerandomize', stateSettings);

    return settings;
  }
}

export default ReactStateSettingsParser;

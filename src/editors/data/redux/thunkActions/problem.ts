import { get, isEmpty } from 'lodash';
import { actions as problemActions } from '../problem';
import { actions as requestActions } from '../requests';
import { selectors as appSelectors } from '../app';
import * as requests from './requests';
import { isLibraryKey } from '../../../../generic/key-utils';
import { OLXParser } from '../../../containers/ProblemEditor/data/OLXParser';
import { parseSettings } from '../../../containers/ProblemEditor/data/SettingsParser';
import { ProblemTypeKeys } from '../../constants/problem';
import ReactStateOLXParser from '../../../containers/ProblemEditor/data/ReactStateOLXParser';
import { camelizeKeys } from '../../../utils';
import { fetchEditorContent } from '../../../containers/ProblemEditor/components/EditProblemView/hooks';
import { RequestKeys } from '../../constants/requests';

// Similar to `import { actions, selectors } from '..';` but avoid circular imports:
const actions = { problem: problemActions, requests: requestActions };
const selectors = { app: appSelectors };

export const switchToAdvancedEditor = () => (dispatch, getState) => {
  const state = getState();
  const editorObject = fetchEditorContent({ format: '' });
  const reactOLXParser = new ReactStateOLXParser({ problem: state.problem, editorObject });
  const rawOLX = reactOLXParser.buildOLX();
  dispatch(actions.problem.updateField({ problemType: ProblemTypeKeys.ADVANCED, rawOLX }));
};

export const switchToMarkdownEditor = () => (dispatch) => {
  dispatch(actions.problem.updateField({ isMarkdownEditorEnabled: true }));
};

export const switchEditor = (editorType) => (dispatch, getState) => {
  if (editorType === 'advanced') {
    switchToAdvancedEditor()(dispatch, getState);
  } else {
    switchToMarkdownEditor()(dispatch);
  }
};

export const isBlankProblem = ({ rawOLX }) => {
  if (['<problem></problem>', '<problem/>'].includes(rawOLX.replace(/\s/g, ''))) {
    return true;
  }
  return false;
};

export const getDataFromOlx = ({ rawOLX, rawSettings, defaultSettings }) => {
  let olxParser;
  let parsedProblem;
  try {
    olxParser = new OLXParser(rawOLX);
    parsedProblem = olxParser.getParsedOLXData();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('The Problem Could Not Be Parsed from OLX. redirecting to Advanced editor.', error);
    return { problemType: ProblemTypeKeys.ADVANCED, rawOLX, settings: parseSettings(rawSettings, defaultSettings) };
  }
  if (parsedProblem?.problemType === ProblemTypeKeys.ADVANCED) {
    return { problemType: ProblemTypeKeys.ADVANCED, rawOLX, settings: parseSettings(rawSettings, defaultSettings) };
  }
  const { settings, ...data } = parsedProblem;
  const parsedSettings = { ...settings, ...parseSettings(rawSettings, defaultSettings) };
  if (!isEmpty(rawOLX) && !isEmpty(data)) {
    return { ...data, rawOLX, settings: parsedSettings };
  }
  return { settings: parsedSettings };
};

export const loadProblem = ({
  rawOLX, rawSettings, defaultSettings, isMarkdownEditorEnabled,
}) => (dispatch) => {
  if (isBlankProblem({ rawOLX })) {
    dispatch(actions.problem.setEnableTypeSelection(camelizeKeys(defaultSettings)));
  } else {
    dispatch(actions.problem.load({
      ...getDataFromOlx({ rawOLX, rawSettings, defaultSettings }),
      rawMarkdown: rawSettings.markdown,
      isMarkdownEditorEnabled,
    }));
  }
};

export const fetchAdvancedSettings = ({ rawOLX, rawSettings, isMarkdownEditorEnabled }) => (dispatch) => {
  const advancedProblemSettingKeys = ['max_attempts', 'showanswer', 'show_reset_button', 'rerandomize'];
  dispatch(requests.fetchAdvancedSettings({
    onSuccess: (response) => {
      const defaultSettings = {};
      Object.entries(response.data as Record<string, any>).forEach(([key, value]) => {
        if (advancedProblemSettingKeys.includes(key)) {
          defaultSettings[key] = value.value;
        }
      });
      dispatch(actions.problem.updateField({ defaultSettings: camelizeKeys(defaultSettings) }));
      loadProblem({
        rawOLX, rawSettings, defaultSettings, isMarkdownEditorEnabled,
      })(dispatch);
    },
    onFailure: () => {
      loadProblem({
        rawOLX, rawSettings, defaultSettings: {}, isMarkdownEditorEnabled,
      })(dispatch);
    },
  }));
};

export const initializeProblem = (blockValue) => (dispatch, getState) => {
  const rawOLX = get(blockValue, 'data.data', '');
  const rawSettings = get(blockValue, 'data.metadata', {});
  const isMarkdownEditorEnabled = get(blockValue, 'data.metadata.markdown_edited', false);
  const learningContextId = selectors.app.learningContextId(getState());
  if (isLibraryKey(learningContextId)) {
    // Content libraries don't yet support defaults for fields like max_attempts, showanswer, etc.
    // So proceed with loading the problem.
    // Though first we need to fake the request or else the problem type selection UI won't display:
    dispatch(actions.requests.completeRequest({ requestKey: RequestKeys.fetchAdvancedSettings, response: {} }));
    dispatch(loadProblem({
      rawOLX, rawSettings, defaultSettings: {}, isMarkdownEditorEnabled,
    }));
  } else {
    // Load the defaults (for max_attempts, etc.) from the course's advanced settings, then proceed:
    dispatch(fetchAdvancedSettings({ rawOLX, rawSettings, isMarkdownEditorEnabled }));
  }
};

export default {
  initializeProblem, switchEditor, switchToAdvancedEditor, fetchAdvancedSettings,
};

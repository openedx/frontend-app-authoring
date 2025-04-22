import { useState } from 'react';
import 'tinymce';
import { StrictDict, convertMarkdownToXml } from '../../../../utils';
import ReactStateSettingsParser from '../../data/ReactStateSettingsParser';
import ReactStateOLXParser from '../../data/ReactStateOLXParser';
import { setAssetToStaticUrl } from '../../../../sharedComponents/TinyMceWidget/hooks';
import { ProblemTypeKeys } from '../../../../data/constants/problem';

export const state = StrictDict({
  // eslint-disable-next-line react-hooks/rules-of-hooks
  isSaveWarningModalOpen: (val) => useState(val),
});

export const saveWarningModalToggle = () => {
  const [isSaveWarningModalOpen, setIsOpen] = state.isSaveWarningModalOpen(false);
  return {
    isSaveWarningModalOpen,
    openSaveWarningModal: () => setIsOpen(true),
    closeSaveWarningModal: () => setIsOpen(false),
  };
};

/** Checks if any tinymce editor in window is dirty */
export const checkIfEditorsDirty = () => {
  const EditorsArray = window.tinymce.editors;
  return Object.entries(EditorsArray).some(([id, editor]) => {
    if (Number.isNaN(parseInt(id, 10))) {
      if (!editor.isNotDirty) {
        return true;
      }
    }
    return false;
  });
};

export const fetchEditorContent = ({ format }) => {
  const editorObject = { hints: [] };
  const EditorsArray = window.tinymce.editors;
  Object.entries(EditorsArray).forEach(([id, editor]) => {
    if (Number.isNaN(parseInt(id, 10))) {
      if (id.startsWith('answer')) {
        const { answers } = editorObject;
        const answerId = id.substring(id.indexOf('-') + 1);
        editorObject.answers = { ...answers, [answerId]: editor.getContent({ format }) };
      } else if (id.includes('Feedback')) {
        const { selectedFeedback, unselectedFeedback, groupFeedback } = editorObject;
        const feedbackId = id.substring(id.indexOf('-') + 1);
        if (id.startsWith('selected')) {
          editorObject.selectedFeedback = { ...selectedFeedback, [feedbackId]: editor.getContent() };
        }
        if (id.startsWith('unselected')) {
          editorObject.unselectedFeedback = { ...unselectedFeedback, [feedbackId]: editor.getContent() };
        }
        if (id.startsWith('group')) {
          editorObject.groupFeedback = { ...groupFeedback, [feedbackId]: editor.getContent() };
        }
      } else if (id.startsWith('hint')) {
        const { hints } = editorObject;
        hints.push(editor.getContent());
      } else {
        editorObject[id] = editor.getContent();
      }
    }
  });
  return editorObject;
};

export const parseState = ({
  problem,
  isAdvanced,
  isMarkdownEditorEnabled,
  ref,
  lmsEndpointUrl,
}) => () => {
  // Constructs the save payload by parsing the current state of the problem editor.
  // If the Markdown editor is enabled, the editor content is converted to OLX using convertMarkdownToXml.
  // For advanced problems, raw editor content is used as OLX; for visual ones, it's built via ReactStateOLXParser.
  // Settings are then parsed from the OLX and returned alongside the OLX content,
  // including markdown incase of markdown editor.
  const contentString = ref?.current?.state.doc.toString();
  const rawOLX = isMarkdownEditorEnabled ? convertMarkdownToXml(contentString) : contentString;
  let reactBuiltOlx;
  if (!isMarkdownEditorEnabled) {
    const editorObject = fetchEditorContent({ format: '' });
    const reactOLXParser = new ReactStateOLXParser({ problem, editorObject });
    reactBuiltOlx = setAssetToStaticUrl({ editorValue: reactOLXParser.buildOLX(), lmsEndpointUrl });
  }
  const reactSettingsParser = new ReactStateSettingsParser({ problem, rawOLX });
  const settings = isAdvanced ? reactSettingsParser.parseRawOlxSettings() : reactSettingsParser.getSettings();
  return {
    settings: {
      ...settings,
      ...(isMarkdownEditorEnabled && { markdown: contentString }),
      markdown_edited: isMarkdownEditorEnabled,
    },
    olx: isAdvanced || isMarkdownEditorEnabled ? rawOLX : reactBuiltOlx,
  };
};

export const checkForNoAnswers = ({ openSaveWarningModal, problem }) => {
  const simpleTextAreaProblems = [ProblemTypeKeys.DROPDOWN, ProblemTypeKeys.NUMERIC, ProblemTypeKeys.TEXTINPUT];
  const editorObject = fetchEditorContent({ format: '' });
  const { problemType } = problem;
  const { answers } = problem;
  const answerTitles = simpleTextAreaProblems.includes(problemType) ? {} : editorObject.answers;

  const hasTitle = () => {
    const titles = [];
    answers.forEach(answer => {
      const title = simpleTextAreaProblems.includes(problemType) ? answer.title : answerTitles[answer.id];
      if (title?.length > 0) {
        titles.push(title);
      }
    });
    if (titles.length > 0) {
      return true;
    }
    return false;
  };

  const hasCorrectAnswer = () => {
    let correctAnswer;
    answers.forEach(answer => {
      if (answer.correct) {
        const title = simpleTextAreaProblems.includes(problemType) ? answer.title : answerTitles[answer.id];
        if (title?.length > 0) {
          correctAnswer = true;
        }
      }
    });
    if (correctAnswer) {
      return true;
    }
    return false;
  };

  if (problemType === ProblemTypeKeys.NUMERIC && !hasTitle()) {
    openSaveWarningModal();
    return true;
  }
  if (!hasCorrectAnswer()) {
    openSaveWarningModal();
    return true;
  }
  return false;
};

export const checkForSettingDiscrepancy = ({
  problem, ref, openSaveWarningModal, isMarkdownEditorEnabled,
}) => {
  const contentString = ref?.current?.state.doc.toString();
  const rawOLX = isMarkdownEditorEnabled ? convertMarkdownToXml(contentString) : contentString;
  const reactSettingsParser = new ReactStateSettingsParser({ problem, rawOLX });
  const problemSettings = reactSettingsParser.getSettings();
  const rawOlxSettings = reactSettingsParser.parseRawOlxSettings();
  let isMismatched = false;

  Object.entries(rawOlxSettings).forEach(([key, value]) => {
    if (value !== problemSettings[key]) {
      isMismatched = true;
    }
  });

  if (isMismatched) {
    openSaveWarningModal();
    return true;
  }
  return false;
};

export const getContent = ({
  problemState,
  openSaveWarningModal,
  isAdvancedProblemType,
  isMarkdownEditorEnabled,
  editorRef,
  lmsEndpointUrl,
}) => {
  const problem = problemState;
  const hasNoAnswers = isAdvancedProblemType || isMarkdownEditorEnabled ? false : checkForNoAnswers({
    problem,
    openSaveWarningModal,
  });
  const hasMismatchedSettings = isAdvancedProblemType || isMarkdownEditorEnabled ? checkForSettingDiscrepancy({
    ref: editorRef,
    problem,
    openSaveWarningModal,
    isMarkdownEditorEnabled,
  }) : false;
  if (!hasNoAnswers && !hasMismatchedSettings) {
    const data = parseState({
      isAdvanced: isAdvancedProblemType,
      ref: editorRef,
      isMarkdownEditorEnabled,
      problem,
      lmsEndpointUrl,
    })();
    return data;
  }
  return null;
};

import { useState } from 'react';
import 'tinymce';
import { StrictDict } from '../../../../utils';
import ReactStateSettingsParser from '../../data/ReactStateSettingsParser';
import ReactStateOLXParser from '../../data/ReactStateOLXParser';
import { setAssetToStaticUrl } from '../../../../sharedComponents/TinyMceWidget/hooks';
import { ProblemTypeKeys } from '../../../../data/constants/problem';

export const state = StrictDict({
  isNoAnswerModalOpen: (val) => useState(val),
});

export const noAnswerModalToggle = () => {
  const [isNoAnswerModalOpen, setIsOpen] = state.isNoAnswerModalOpen(false);
  return {
    isNoAnswerModalOpen,
    openNoAnswerModal: () => setIsOpen(true),
    closeNoAnswerModal: () => setIsOpen(false),
  };
};

export const fetchEditorContent = ({ format }) => {
  const editorObject = { hints: [] };
  const EditorsArray = window.tinymce.editors;
  Object.entries(EditorsArray).forEach(([id, editor]) => {
    if (Number.isNaN(parseInt(id))) {
      if (id.startsWith('answer')) {
        const { answers } = editorObject;
        const answerId = id.substring(id.indexOf('-') + 1);
        editorObject.answers = { ...answers, [answerId]: editor.getContent({ format }) };
      } else if (id.includes('Feedback')) {
        const { selectedFeedback, unselectedFeedback, groupFeedback } = editorObject;
        const feedbackId = id.substring(id.indexOf('-') + 1);
        if (id.startsWith('selected')) {
          editorObject.selectedFeedback = { ...selectedFeedback, [feedbackId]: editor.getContent({ format }) };
        }
        if (id.startsWith('unselected')) {
          editorObject.unselectedFeedback = { ...unselectedFeedback, [feedbackId]: editor.getContent({ format }) };
        }
        if (id.startsWith('group')) {
          editorObject.groupFeedback = { ...groupFeedback, [feedbackId]: editor.getContent({ format }) };
        }
      } else if (id.startsWith('hint')) {
        const { hints } = editorObject;
        hints.push(editor.getContent({ format }));
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
  ref,
  assets,
  lmsEndpointUrl,
}) => () => {
  const editorObject = fetchEditorContent({ format: '' });
  const reactSettingsParser = new ReactStateSettingsParser(problem);
  const reactOLXParser = new ReactStateOLXParser({ problem, editorObject });
  const reactBuiltOlx = setAssetToStaticUrl({ editorValue: reactOLXParser.buildOLX(), assets, lmsEndpointUrl });
  const rawOLX = ref?.current?.state.doc.toString();
  return {
    settings: reactSettingsParser.getSettings(),
    olx: isAdvanced ? rawOLX : reactBuiltOlx,
  };
};

export const checkForNoAnswers = ({ openNoAnswerModal, problem }) => {
  const simpleTextAreaProblems = [ProblemTypeKeys.DROPDOWN, ProblemTypeKeys.NUMERIC, ProblemTypeKeys.TEXTINPUT];
  const editorObject = fetchEditorContent({ format: '' });
  const { problemType } = problem;
  const { answers } = problem;
  const answerTitles = simpleTextAreaProblems.includes(problemType) ? {} : editorObject.answers;

  const hasTitle = () => {
    const titles = [];
    answers.forEach(answer => {
      const title = simpleTextAreaProblems.includes(problemType) ? answer.title : answerTitles[answer.id];
      if (title.length > 0) {
        titles.push(title);
      }
    });
    if (titles.length > 0) {
      return true;
    }
    return false;
  };

  const hasNoCorrectAnswer = () => {
    let correctAnswer;
    answers.forEach(answer => {
      if (answer.correct) {
        const title = simpleTextAreaProblems.includes(problemType) ? answer.title : answerTitles[answer.id];
        if (title.length > 0) {
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
    openNoAnswerModal();
    return true;
  }
  if (!hasNoCorrectAnswer()) {
    openNoAnswerModal();
    return true;
  }
  return false;
};

export const getContent = ({
  problemState,
  openNoAnswerModal,
  isAdvancedProblemType,
  editorRef,
  assets,
  lmsEndpointUrl,
}) => {
  const problem = problemState;
  const hasNoAnswers = checkForNoAnswers({
    problem,
    openNoAnswerModal,
  });
  if (!hasNoAnswers) {
    const data = parseState({
      isAdvanced: isAdvancedProblemType,
      ref: editorRef,
      problem,
      assets,
      lmsEndpointUrl,
    })();
    return data;
  }
  return null;
};

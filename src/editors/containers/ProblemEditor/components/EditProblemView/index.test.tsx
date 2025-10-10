import React from 'react';
import { screen, fireEvent, initializeMocks } from '@src/testUtils';
import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';
import { ProblemTypeKeys } from '@src/editors/data/constants/problem';
import EditProblemView from './index';

const { saveBlock } = require('../../../../hooks');
const { saveWarningModalToggle } = require('./hooks');

jest.mock('./AnswerWidget', () => function mockAnswerWidget() {
  return <div>AnswerWidget</div>;
});
jest.mock('./SettingsWidget', () => function mockSettingsWidget() {
  return <div>SettingsWidget</div>;
});
jest.mock('./QuestionWidget', () => function mmockQuestionWidget() {
  return <div>QuestionWidget</div>;
});
jest.mock('../../../EditorContainer', () => function mockEditorContainer({ children }) {
  return <section>{children}</section>;
});
jest.mock('../../../../sharedComponents/RawEditor', () => function mockRawEditor({ lang, content }) {
  return <div>{lang}:{content}</div>;
});
jest.mock('./ExplanationWidget', () => function mockExplanationWidget() {
  return <div>ExplanationWidget</div>;
});
jest.mock('../../../../hooks', () => ({
  saveBlock: jest.fn(),
}));
jest.mock('./hooks', () => ({
  checkIfEditorsDirty: jest.fn(() => false),
  parseState: jest.fn(() => () => 'parsed-content'),
  saveWarningModalToggle: jest.fn(() => ({
    isSaveWarningModalOpen: true,
    openSaveWarningModal: jest.fn(),
    closeSaveWarningModal: jest.fn(),
  })),
  getContent: jest.fn(() => 'content'),
}));

// 🗂️ Initial state based on baseProps
const initialState: PartialEditorState = {
  app: {
    lmsEndpointUrl: null,
  },
  problem: {
    problemType: null,
    isMarkdownEditorEnabled: false,
    rawOLX: '<problem></problem>',
    rawMarkdown: '## Problem',
    isDirty: false,
  },
};

describe('EditProblemView', () => {
  const returnFunction = jest.fn();

  beforeEach(() => {
    initializeMocks();
  });

  it('renders standard problem widgets', () => {
    editorRender(<EditProblemView returnFunction={returnFunction} />, { initialState });
    expect(screen.getByText('QuestionWidget')).toBeInTheDocument();
    expect(screen.getByText('ExplanationWidget')).toBeInTheDocument();
    expect(screen.getByText('AnswerWidget')).toBeInTheDocument();
    expect(screen.getByText('SettingsWidget')).toBeInTheDocument();
    expect(screen.queryByText(/xml:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/markdown:/)).not.toBeInTheDocument();
  });

  it('renders advanced problem with RawEditor', () => {
    editorRender(<EditProblemView returnFunction={returnFunction} />, {
      initialState: {
        ...initialState,
        problem: {
          ...initialState.problem,
          problemType: ProblemTypeKeys.ADVANCED,
        },
      },
    });
    expect(screen.getByText('xml:<problem></problem>')).toBeInTheDocument();
    expect(screen.getByText('SettingsWidget')).toBeInTheDocument();
  });

  it('renders markdown editor with RawEditor', () => {
    const modifiedInitialState: PartialEditorState = {
      app: {
        lmsEndpointUrl: null,
      },
      problem: {
        problemType: null,
        isMarkdownEditorEnabled: true,
        rawOLX: '<problem></problem>',
        rawMarkdown: '## Problem',
        isDirty: false,
      },
    };
    editorRender(<EditProblemView returnFunction={returnFunction} />, { initialState: modifiedInitialState });
    expect(screen.getByText('markdown:## Problem')).toBeInTheDocument();
  });

  it('shows AlertModal with correct title/body for standard', () => {
    editorRender(<EditProblemView returnFunction={returnFunction} />, { initialState });
    expect(screen.getAllByText('No correct answer has been specified.').length).toBeGreaterThan(0);
  });

  it('calls saveBlock when save button is clicked', () => {
    editorRender(<EditProblemView returnFunction={returnFunction} />, { initialState });
    const saveBtn = screen.getByRole('button', { name: 'Ok' });
    fireEvent.click(saveBtn);
    expect(saveBlock).toHaveBeenCalled();
  });

  it('calls closeSaveWarningModal when cancel button is clicked', () => {
    const closeSaveWarningModal = jest.fn();
    saveWarningModalToggle.mockReturnValue({
      isSaveWarningModalOpen: true,
      openSaveWarningModal: jest.fn(),
      closeSaveWarningModal,
    });
    editorRender(<EditProblemView returnFunction={returnFunction} />, { initialState });
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(closeSaveWarningModal).toHaveBeenCalled();
  });
});

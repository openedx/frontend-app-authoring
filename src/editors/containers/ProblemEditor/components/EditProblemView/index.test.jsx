import React from 'react';
import { Provider } from 'react-redux';
import {
  render as baseRender, screen, fireEvent, initializeMocks,
} from '../../../../../testUtils';
import { EditProblemViewInternal, mapStateToProps } from './index';
import { ProblemTypeKeys } from '../../../../data/constants/problem';
import { EditorContextProvider } from '../../../../EditorContext';
import editorStore from '../../../../data/store';
import { selectors } from '../../../../data/redux';

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

const render = (ui) => baseRender(ui, {
  extraWrapper: ({ children }) => (
    <EditorContextProvider learningContextId="course-v1:Org+COURSE+RUN">
      <Provider store={editorStore}>
        {children}
      </Provider>
    </EditorContextProvider>
  ),
});

describe('EditProblemView', () => {
  const baseProps = {
    problemType: 'standard',
    isMarkdownEditorEnabled: false,
    problemState: { rawOLX: '<problem></problem>', rawMarkdown: '## Problem' },
    lmsEndpointUrl: null,
    returnUrl: '/return',
    analytics: {},
    isDirty: false,
    returnFunction: jest.fn(),
  };

  beforeEach(() => {
    initializeMocks();
  });

  it('renders standard problem widgets', () => {
    render(<EditProblemViewInternal {...baseProps} />);
    expect(screen.getByText('QuestionWidget')).toBeInTheDocument();
    expect(screen.getByText('ExplanationWidget')).toBeInTheDocument();
    expect(screen.getByText('AnswerWidget')).toBeInTheDocument();
    expect(screen.getByText('SettingsWidget')).toBeInTheDocument();
    expect(screen.queryByText(/xml:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/markdown:/)).not.toBeInTheDocument();
  });

  it('renders advanced problem with RawEditor', () => {
    render(<EditProblemViewInternal {...baseProps} problemType={ProblemTypeKeys.ADVANCED} />);
    expect(screen.getByText('xml:<problem></problem>')).toBeInTheDocument();
    expect(screen.getByText('SettingsWidget')).toBeInTheDocument();
  });

  it('renders markdown editor with RawEditor', () => {
    render(<EditProblemViewInternal {...baseProps} isMarkdownEditorEnabled />);
    expect(screen.getByText('markdown:## Problem')).toBeInTheDocument();
  });

  it('shows AlertModal with correct title/body for standard', () => {
    render(<EditProblemViewInternal {...baseProps} />);
    expect(screen.getAllByText('No correct answer has been specified.').length).toBeGreaterThan(0);
  });

  it('calls saveBlock when save button is clicked', () => {
    render(<EditProblemViewInternal {...baseProps} />);
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
    render(<EditProblemViewInternal {...baseProps} />);
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(closeSaveWarningModal).toHaveBeenCalled();
  });

  it('sets isMarkdownEditorEnabled true only if both selectors return true', () => {
    const state = { };

    selectors.problem = {
      isMarkdownEditorEnabled: jest.fn(() => true),
      problemType: jest.fn(),
      completeState: jest.fn(),
      isDirty: jest.fn(),
    };
    selectors.app = {
      isMarkdownEditorEnabledForCourse: jest.fn(() => true),
      analytics: jest.fn(),
      lmsEndpointUrl: jest.fn(),
      returnUrl: jest.fn(),
    };

    const props = mapStateToProps(state);
    expect(selectors.problem.isMarkdownEditorEnabled).toHaveBeenCalledWith(state);
    expect(selectors.app.isMarkdownEditorEnabledForCourse).toHaveBeenCalledWith(state);
    expect(props.isMarkdownEditorEnabled).toBe(true);

    selectors.problem.isMarkdownEditorEnabled.mockReturnValue(false);
    expect(mapStateToProps(state).isMarkdownEditorEnabled).toBe(false);

    selectors.problem.isMarkdownEditorEnabled.mockReturnValue(true);
    selectors.app.isMarkdownEditorEnabledForCourse.mockReturnValue(false);
    expect(mapStateToProps(state).isMarkdownEditorEnabled).toBe(false);
  });
});

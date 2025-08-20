import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';
import { thunkActions } from '@src/editors/data/redux';

import ProblemEditor from './index';
import messages from './messages';

// Mock child components for easy selection
jest.mock('./components/SelectTypeModal', () => function mockSelectTypeModal(props: any) {
  return <div>SelectTypeModal {props.onClose && 'withOnClose'}</div>;
});
jest.mock('./components/EditProblemView', () => function mockEditProblemView(props: any) {
  return <div>EditProblemView {props.onClose && 'withOnClose'} {props.returnFunction && 'withReturnFunction'}</div>;
});
// Mock the initializeProblem method:
jest.spyOn(thunkActions.problem, 'initializeProblem').mockImplementation(
  () => () => Promise.resolve(),
);

describe('ProblemEditor', () => {
  const baseProps = {
    onClose: jest.fn(),
    returnFunction: jest.fn(),
  };

  beforeEach(() => {
    initializeMocks();
  });

  it('renders Spinner when blockFinished is false', () => {
    const initialState: PartialEditorState = {
      app: {
        blockId: 'problem1',
        blockType: 'problem',
      },
      problem: { problemType: 'multiplechoiceresponse' },
      requests: {
        fetchBlock: { status: 'pending' },
        fetchAdvancedSettings: { status: 'completed' },
      },
    };

    editorRender(<ProblemEditor {...baseProps} />, { initialState });
    const spinnerText = screen.getByText('Loading Problem Editor');
    expect(spinnerText.parentElement).toHaveClass('pgn__spinner');
  });

  it('renders Spinner when advancedSettingsFinished is false', () => {
    const initialState: PartialEditorState = {
      app: {
        blockId: 'problem1',
        blockType: 'problem',
      },
      problem: { problemType: null },
      requests: {
        fetchBlock: { status: 'pending' },
        fetchAdvancedSettings: { status: 'completed' },
      },
    };

    editorRender(<ProblemEditor {...baseProps} />, { initialState });
    const spinnerText = screen.getByText('Loading Problem Editor');
    expect(spinnerText.parentElement).toHaveClass('pgn__spinner');
  });

  it('renders block failed message when blockFailed is true', () => {
    const initialState: PartialEditorState = {
      app: {
        blockId: 'problem1',
        blockType: 'problem',
      },
      problem: { problemType: 'multiplechoiceresponse' },
      requests: {
        fetchBlock: { status: 'failed' },
        fetchAdvancedSettings: { status: 'completed' },
      },
    };

    editorRender(<ProblemEditor {...baseProps} />, { initialState });
    expect(screen.getByText(messages.blockFailed.defaultMessage)).toBeInTheDocument();
  });

  it('renders SelectTypeModal when problemType is null', () => {
    const initialState: PartialEditorState = {
      app: {
        blockId: 'problem1',
        blockType: 'problem',
      },
      problem: { problemType: null },
      requests: {
        fetchBlock: { status: 'completed' },
        fetchAdvancedSettings: { status: 'completed' },

      },
    };
    editorRender(<ProblemEditor {...baseProps} />, { initialState });
    expect(screen.getByText(/SelectTypeModal/)).toBeInTheDocument();
  });

  it('renders EditProblemView when problemType is not null', () => {
    const initialState: PartialEditorState = {
      app: {
        blockId: 'problem1',
        blockType: 'problem',
      },
      problem: { problemType: 'advanced' },
      requests: {
        fetchBlock: { status: 'completed' },
        fetchAdvancedSettings: { status: 'completed' },
      },

    };

    editorRender(<ProblemEditor {...baseProps} />, { initialState });
    expect(screen.getByText(/EditProblemView/)).toBeInTheDocument();
  });
});

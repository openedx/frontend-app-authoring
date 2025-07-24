import React from 'react';
import { screen, initializeMocks } from '../../../testUtils';
import editorRender from '../../editorTestRender';
import { initializeStore } from '../../data/redux';
import ProblemEditor from './index';
import messages from './messages';
// Mock child components for easy selection
jest.mock('./components/SelectTypeModal', () => function mockSelectTypeModal(props: any) {
  return <div>SelectTypeModal {props.onClose && 'withOnClose'}</div>;
});
jest.mock('./components/EditProblemView', () => function mockEditProblemView(props: any) {
  return <div>EditProblemView {props.onClose && 'withOnClose'} {props.returnFunction && 'withReturnFunction'}</div>;
});

jest.mock('../../data/redux', () => ({
  __esModule: true,
  ...jest.requireActual('../../data/redux'),
  thunkActions: {
    ...jest.requireActual('../../data/redux').thunkActions,
    problem: {
      ...jest.requireActual('../../data/redux').thunkActions.problem,
      initializeProblem: jest.fn(() => () => Promise.resolve()),
    },
  },
}));

describe('ProblemEditor', () => {
  const baseProps = {
    onClose: jest.fn(),
    returnFunction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Spinner when blockFinished is false', () => {
    const initialState = {
      app: { shouldCreateBlock: false },
      problem: { problemType: 'standard' },
      requests: {
        fetchBlock: { status: 'completed' },
        fetchAdvancedSettings: { status: 'pending' },

      },
    };
    initializeMocks({
      initializeStore,
      initialState,
    });

    const { container } = editorRender(<ProblemEditor {...baseProps} />, { initialState });
    const spinner = container.querySelector('.pgn__spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('screenreadertext', 'Loading Problem Editor');
  });

  it('renders Spinner when advancedSettingsFinished is false', () => {
    const initialState = {
      app: { shouldCreateBlock: false },
      problem: { problemType: null },
      requests: {
        fetchBlock: { status: 'pending' },
        fetchAdvancedSettings: { status: 'completed' },
      },
    };
    initializeMocks({
      initializeStore,
      initialState,
    });

    const { container } = editorRender(<ProblemEditor {...baseProps} />, { initialState });
    const spinner = container.querySelector('.pgn__spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('screenreadertext', 'Loading Problem Editor');
  });

  it('renders block failed message when blockFailed is true', () => {
    const initialState = {
      app: {
        blockId: '',
        blockType: true,
      },
      problem: { problemType: 'standard' },
      requests: {
        fetchBlock: { status: 'failed' },
        fetchAdvancedSettings: { status: 'completed' },
      },
    };

    initializeMocks({
      initializeStore,
      initialState,
    });
    editorRender(<ProblemEditor {...baseProps} />, { initialState });
    expect(screen.getByText(messages.blockFailed.defaultMessage)).toBeInTheDocument();
  });

  it('renders SelectTypeModal when problemType is null', () => {
    const initialState = {
      app: {
        blockId: '',
        blockType: true,
      },
      problem: { problemType: null },
      requests: {
        fetchBlock: { status: 'completed' },
        fetchAdvancedSettings: { status: 'completed' },

      },
    };
    initializeMocks({
      initializeStore,
      initialState,
    });
    editorRender(<ProblemEditor {...baseProps} />, { initialState });
    expect(screen.getByText(/SelectTypeModal/)).toBeInTheDocument();
  });

  it('renders EditProblemView when problemType is not null', () => {
    const initialState = {
      app: {
        blockId: '',
        blockType: true,
      },
      problem: { problemType: 'advanced' },
      requests: {
        fetchBlock: { status: 'completed' },
        fetchAdvancedSettings: { status: 'completed' },
      },

    };
    initializeMocks({
      initializeStore,
      initialState,
    });

    editorRender(<ProblemEditor {...baseProps} />, { initialState });
    expect(screen.getByText(/EditProblemView/)).toBeInTheDocument();
  });
});

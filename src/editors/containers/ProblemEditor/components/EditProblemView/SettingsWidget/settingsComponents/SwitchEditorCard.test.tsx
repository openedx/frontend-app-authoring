import React from 'react';
import {
  screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import SwitchEditorCard from './SwitchEditorCard';
import { thunkActions } from '../../../../../../data/redux';
import { ProblemTypeKeys } from '../../../../../../data/constants/problem';
import editorRender from '../../../../../../modifiedEditorTestRender';

jest.mock('../../../../../../data/redux/thunkActions/problem', () => ({
  switchEditor: jest.fn(() => ({ type: 'SWITCH_EDITOR' })),
}));

describe('SwitchEditorCard', () => {
  const initialStateBase = {
    problem: {
      isMarkdownEditorEnabled: false,
    },
    app: {
      isMarkdownEditorEnabledForCourse: true,
    },
  };

  beforeEach(() => {
    initializeMocks({ initialState: initialStateBase });
    jest.clearAllMocks();
  });

  test('renders SwitchEditorCard and opens modal', () => {
    editorRender(<SwitchEditorCard problemType="stringresponse" editorType="markdown" />, {
      initialState: initialStateBase,
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const switchButton = screen.getByRole('button', { name: 'Switch to markdown editor' });
    expect(switchButton).toBeInTheDocument();

    fireEvent.click(switchButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('dispatches switchEditor on confirm', () => {
    editorRender(<SwitchEditorCard problemType="stringresponse" editorType="markdown" />, {
      initialState: initialStateBase,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Switch to markdown editor' }));
    const confirmButton = screen.getByRole('button', { name: 'Switch to markdown editor' });

    fireEvent.click(confirmButton);

    expect(thunkActions.problem.switchEditor).toHaveBeenCalledWith('markdown');
  });

  test('renders nothing for advanced problem type', () => {
    editorRender(<SwitchEditorCard problemType={ProblemTypeKeys.ADVANCED} editorType="markdown" />, {
      initialState: initialStateBase,
    });

    expect(screen.getByTestId('redux-provider').outerHTML)
      .toBe('<div data-testid="redux-provider"></div>');
  });

  test('renders nothing when markdown editor already enabled', () => {
    const modifiedState = {
      ...initialStateBase,
      problem: { isMarkdownEditorEnabled: true },
    };
    initializeMocks({ initialState: modifiedState });
    editorRender(<SwitchEditorCard problemType="stringresponse" editorType="markdown" />, {
      initialState: modifiedState,
    });
    expect(screen.getByTestId('redux-provider').outerHTML)
      .toBe('<div data-testid="redux-provider"></div>');
  });
});

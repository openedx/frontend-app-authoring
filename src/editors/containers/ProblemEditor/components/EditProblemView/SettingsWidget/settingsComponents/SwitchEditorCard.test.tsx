import React from 'react';
import { screen, initializeMocks, within } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { thunkActions } from '@src/editors/data/redux';
import { ProblemTypeKeys } from '@src/editors/data/constants/problem';
import SwitchEditorCard from './SwitchEditorCard';

// Spy on switchEditor thunk
const switchEditorSpy = jest.spyOn(thunkActions.problem, 'switchEditor');

describe('SwitchEditorCard - markdown', () => {
  const baseProps = {
    problemType: 'stringresponse',
    editorType: 'markdown',
  };

  // ✅ Full initialState aligned with EditorState shape
  const baseInitialState: PartialEditorState = {
    problem: {
      isMarkdownEditorEnabled: false,
      problemType: 'stringresponse',
    },
    app: {

    },
  };

  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
  });

  test('renders SwitchEditorCard and opens modal on click', async () => {
    mockWaffleFlags({ useReactMarkdownEditor: true });

    editorRender(<SwitchEditorCard {...baseProps} />, {
      initialState: baseInitialState,
    });

    const user = userEvent.setup();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const switchButton = screen.getByRole('button', { name: 'Switch to markdown editor' });
    expect(switchButton).toBeInTheDocument();

    await user.click(switchButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('dispatches switchEditor when confirm clicked', async () => {
    mockWaffleFlags({ useReactMarkdownEditor: true });

    editorRender(<SwitchEditorCard {...baseProps} />, {
      initialState: baseInitialState,
    });

    const user = userEvent.setup();
    const switchButton = screen.getByRole('button', { name: 'Switch to markdown editor' });
    await user.click(switchButton);

    const modal = screen.getByRole('dialog');
    const confirmButton = within(modal).getByRole('button', { name: 'Switch to markdown editor' });

    expect(switchEditorSpy).not.toHaveBeenCalled();
    await user.click(confirmButton);
    expect(switchEditorSpy).toHaveBeenCalledWith('markdown');
  });

  test('renders nothing for advanced problemType', () => {
    const { container } = editorRender(
      <SwitchEditorCard {...baseProps} problemType={ProblemTypeKeys.ADVANCED} />,
      { initialState: baseInitialState },
    );
    const reduxWrapper = container.firstChild;
    expect((reduxWrapper as HTMLElement | null)?.innerHTML).toBe('');
  });

  test('returns null when markdown editor already enabled', () => {
    mockWaffleFlags({ useReactMarkdownEditor: true });

    const modifiedState = {
      ...baseInitialState,
      problem: { isMarkdownEditorEnabled: true },
    };

    const { container } = editorRender(<SwitchEditorCard {...baseProps} />, {
      initialState: modifiedState,
    });

    const reduxWrapper = container.firstChild as HTMLElement | null;
    expect(reduxWrapper?.innerHTML).toBe('');
  });
});

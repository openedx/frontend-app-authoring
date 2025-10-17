import React from 'react';
import { screen, initializeMocks, within } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { editorRender } from '@src/editors/editorTestRender';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { thunkActions } from '@src/editors/data/redux';
import { ProblemEditorContextProvider } from '../../ProblemEditorContext';
import SwitchEditorCard from './SwitchEditorCard';

const switchEditorSpy = jest.spyOn(thunkActions.problem, 'switchEditor');

describe('SwitchEditorCard - markdown', () => {
  const baseProps = {
    problemType: 'stringresponse',
    editorType: 'markdown',
  };
  const editorRef = { current: null };

  const renderSwitchEditorCard = (overrideProps = {}) => editorRender(
    <ProblemEditorContextProvider editorRef={editorRef}>
      <SwitchEditorCard {...baseProps} {...overrideProps} />
    </ProblemEditorContextProvider>,
  );

  beforeEach(() => {
    initializeMocks();
  });

  test('renders SwitchEditorCard', async () => {
    // Markdown Editor support is on for this course:
    mockWaffleFlags({ useReactMarkdownEditor: true });
    // The markdown editor is not currently active (default)

    renderSwitchEditorCard();
    const user = userEvent.setup();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const switchButton = screen.getByRole('button', { name: 'Switch to markdown editor' });
    expect(switchButton).toBeInTheDocument();
    await user.click(switchButton);
    // A confirmation dialog is shown:
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('calls switchEditor function when confirm button is clicked', async () => {
    // Markdown Editor support is on for this course:
    mockWaffleFlags({ useReactMarkdownEditor: true });
    // The markdown editor is not currently active (default)

    renderSwitchEditorCard();
    const user = userEvent.setup();
    const switchButton = screen.getByRole('button', { name: 'Switch to markdown editor' });
    expect(switchButton).toBeInTheDocument();
    await user.click(switchButton);

    const modal = screen.getByRole('dialog');
    const confirmButton = within(modal).getByRole('button', { name: 'Switch to markdown editor' });
    expect(confirmButton).toBeInTheDocument();
    expect(switchEditorSpy).not.toHaveBeenCalled();
    await user.click(confirmButton);
    expect(switchEditorSpy).toHaveBeenCalledWith('markdown', editorRef);
    // Markdown editor would now be active.
  });

  test('renders nothing for advanced problemType', () => {
    const { container } = renderSwitchEditorCard({ problemType: 'advanced' });
    const reduxWrapper = (container.firstChild as HTMLElement | null);
    expect(reduxWrapper?.innerHTML).toBe('');
  });
});

import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import { SwitchEditorCardInternal as SwitchEditorCard, mapDispatchToProps } from './SwitchEditorCard';
import { thunkActions } from '../../../../../../data/redux';

describe('SwitchEditorCard', () => {
  const mockSwitchEditor = jest.fn().mockName('switchEditor');
  const baseProps = {
    switchEditor: mockSwitchEditor,
    problemType: 'stringresponse',
    editorType: 'markdown',
    isMarkdownEditorEnabled: false,
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('renders SwitchEditorCard', () => {
    render(<SwitchEditorCard {...baseProps} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const switchButton = screen.getByRole('button', { name: 'Switch to markdown editor' });
    expect(switchButton).toBeInTheDocument();
    fireEvent.click(switchButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('calls switchEditor function when confirm button is clicked', () => {
    render(<SwitchEditorCard {...baseProps} />);
    const switchButton = screen.getByRole('button', { name: 'Switch to markdown editor' });
    expect(switchButton).toBeInTheDocument();
    fireEvent.click(switchButton);
    const confirmButton = screen.getByRole('button', { name: 'Switch to markdown editor' });
    expect(confirmButton).toBeInTheDocument();
    fireEvent.click(confirmButton);
    expect(mockSwitchEditor).toHaveBeenCalledWith('markdown');
  });

  test('renders nothing for advanced problemType', () => {
    const { container } = render(<SwitchEditorCard {...baseProps} problemType="advanced" />);
    const reduxWrapper = (container.firstChild as HTMLElement | null);
    expect(reduxWrapper?.innerHTML).toBe('');
  });

  test('snapshot: SwitchEditorCard returns null when editor is Markdown', () => {
    const { container } = render(<SwitchEditorCard {...baseProps} editorType="markdown" isMarkdownEditorEnabled />);
    const reduxWrapper = (container.firstChild as HTMLElement | null);
    expect(reduxWrapper?.innerHTML).toBe('');
  });

  describe('mapDispatchToProps', () => {
    test('updateField from actions.problem.updateField', () => {
      expect(mapDispatchToProps.switchEditor).toEqual(thunkActions.problem.switchEditor);
    });
  });
});

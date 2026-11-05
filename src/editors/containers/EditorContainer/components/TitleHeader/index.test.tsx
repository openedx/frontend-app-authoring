import React from 'react';
import {
  render,
  screen,
  initializeMocks,
} from '@src/testUtils';
import * as redux from 'react-redux';

import * as hooks from './hooks';
import TitleHeader from '.';

describe('TitleHeader', () => {
  // setting any type to prevent warnings on the mockReturnValue
  const localTitleHooksProps: any = {
    inputRef: jest.fn().mockName('localTitleHooks.inputRef'),
    isEditing: false,
    handleChange: jest.fn().mockName('localTitleHooks.handleChange'),
    handleKeyDown: jest.fn().mockName('localTitleHooks.handleKeyDown'),
    localTitle: 'TeST LocALtitLE',
    startEditing: jest.fn().mockName('localTitleHooks.startEditing'),
    updateTitle: jest.fn().mockName('localTitleHooks.updateTitle'),
  };

  beforeEach(() => {
    initializeMocks();
    jest.spyOn(hooks, 'localTitleHooks').mockReturnValue(localTitleHooksProps);
    jest.spyOn(redux, 'useSelector').mockReturnValueOnce('Title mock');
  });

  const props = {
    isInitialized: true,
  };

  describe('behavior', () => {
    it('calls localTitleHooks with initialization args', () => {
      const mockDispatch = jest.fn();
      jest.spyOn(redux, 'useDispatch').mockReturnValueOnce(mockDispatch);
      render(<TitleHeader {...props} />);
      expect(screen.getByText('Title mock')).toBeInTheDocument();
      expect(hooks.localTitleHooks).toHaveBeenCalledWith({ dispatch: mockDispatch });
    });
  });

  describe('renders', () => {
    test('component is not initialized and renders loading text', () => {
      render(<TitleHeader isInitialized={false} />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    // The title hooks seed their state from the block's title: they must not run
    // against an empty store, and the loading render must not run a different
    // hook list than the initialized one.
    test('mounts the title hooks only once the editor is initialized', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const { rerender } = render(<TitleHeader isInitialized={false} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(hooks.localTitleHooks).not.toHaveBeenCalled();
      expect(redux.useSelector).not.toHaveBeenCalled();

      rerender(<TitleHeader isInitialized />);

      expect(hooks.localTitleHooks).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Edit Title' })).toBeInTheDocument();

      const logged = errorSpy.mock.calls.map((call) => String(call[0])).join('\n');
      errorSpy.mockRestore();
      expect(logged).not.toMatch(/change in the order of Hooks/);
    });

    test('renders component correctly when initialized is true', () => {
      render(<TitleHeader {...props} />);
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Title mock')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Title' })).toBeInTheDocument();
    });

    test('disables the edit button while editing is locked', () => {
      render(<TitleHeader {...props} isEditDisabled />);
      expect(screen.getByRole('button', { name: 'Edit Title' })).toBeDisabled();
    });

    test('shows the plain title, not the input, when locked mid-edit', () => {
      jest.spyOn(hooks, 'localTitleHooks').mockReturnValue({ ...localTitleHooksProps, isEditing: true });
      render(<TitleHeader {...props} isEditDisabled />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('Title mock')).toBeInTheDocument();
    });

    test('renders editing component', () => {
      jest.spyOn(hooks, 'localTitleHooks').mockReturnValue({ ...localTitleHooksProps, isEditing: true });
      render(<TitleHeader {...props} />);
      const editable = screen.getByRole('textbox');
      expect(editable).toBeInTheDocument();
      expect(editable).toHaveDisplayValue('TeST LocALtitLE');
    });
  });
});

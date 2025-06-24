import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import * as reactredux from 'react-redux';
import { formatMessage } from '../../../../../../testUtils';
import ResetCard from './ResetCard';
import * as hooks from '../hooks';

describe('ResetCard', () => {
  const resetText = "Determines whether a 'Reset' button is shown so the user may reset their answer, generally for use in practice or formative assessments.";
  const props = {
    showResetButton: false,
    updateSettings: jest.fn().mockName('args.updateSettings'),
    intl: { formatMessage },
  };

  const resetCardHooksProps = {
    setResetTrue: jest.fn().mockName('resetCardHooks.setResetTrue'),
    setResetFalse: jest.fn().mockName('resetCardHooks.setResetFalse'),
  };

  beforeEach(() => {
    initializeMocks();
    jest.spyOn(reactredux, 'useSelector').mockImplementation((args) => args);
  });

  describe('behavior', () => {
    it('calls resetCardHooks when initialized', () => {
      jest.spyOn(hooks, 'resetCardHooks').mockReturnValue(resetCardHooksProps);
      render(<ResetCard {...props} />);
      expect(hooks.resetCardHooks).toHaveBeenCalledWith(props.updateSettings);
    });
  });

  describe('renders', () => {
    test('renders reset true setting card', () => {
      render(<ResetCard {...props} showResetButton />);
      expect(screen.getByText('Show reset option')).toBeInTheDocument();
      expect(screen.getByText('True')).toBeInTheDocument();
    });

    test('renders reset false setting card', () => {
      render(<ResetCard {...props} />);
      expect(screen.getByText('Show reset option')).toBeInTheDocument();
      expect(screen.getByText('False')).toBeInTheDocument();
    });

    test('renders link when isLibrary is false', () => {
      jest.spyOn(reactredux, 'useSelector').mockReturnValueOnce(false); // mock isLibrary value
      render(<ResetCard {...props} />);
      const resetOption = screen.getByText('Show reset option');
      expect(resetOption).toBeInTheDocument();
      fireEvent.click(resetOption);
      expect(screen.getByText(resetText)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Set a default value in advanced settings in a new tab' })).toBeInTheDocument();
    });

    test('do not render link when isLibrary is true', () => {
      jest.spyOn(reactredux, 'useSelector').mockReturnValueOnce(true); // mock isLibrary value
      render(<ResetCard {...props} />);
      const resetOption = screen.getByText('Show reset option');
      expect(resetOption).toBeInTheDocument();
      fireEvent.click(resetOption);
      expect(screen.getByText(resetText)).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Set a default value in advanced settings in a new tab' })).not.toBeInTheDocument();
    });
  });
});

import React from 'react';
import {
  render, screen, initializeMocks,
} from '@src/testUtils';

import * as mod from './ErrorSummary';

const { ErrorSummary } = mod;

describe('ErrorSummary', () => {
  const errors = {
    widgetWithError: [{ err1: 'mSg', err2: 'msG2' }, jest.fn()],
    widgetWithNoError: [{}, jest.fn()],
  };
  beforeEach(() => {
    initializeMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('renders', () => {
    jest.spyOn(React, 'useContext').mockReturnValueOnce({});
    test('renders as expected when there are no errors', () => {
      jest.spyOn(mod, 'showAlert').mockReturnValue(false);
      render(<ErrorSummary />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('snapshots: renders as expected when there are errors', () => {
      jest.spyOn(mod, 'showAlert').mockReturnValue(true);
      render(<ErrorSummary />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('hasNoError', () => {
    it('returns true', () => {
      expect(mod.hasNoError(errors.widgetWithError)).toEqual(false);
    });
    it('returns false', () => {
      expect(mod.hasNoError(errors.widgetWithNoError)).toEqual(true);
    });
  });

  describe('showAlert', () => {
    it('returns true', () => {
      jest.spyOn(mod, 'hasNoError').mockReturnValue(false);
      expect(mod.showAlert(errors)).toEqual(true);
    });
    it('returns false', () => {
      jest.spyOn(mod, 'hasNoError').mockReturnValue(true);
      expect(mod.showAlert(errors)).toEqual(false);
    });
  });
});

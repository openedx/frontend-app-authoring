import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import * as module from './ErrorSummary';

describe('ErrorSummary', () => {
  const errors = {
    widgetWithError: [{ err1: 'mSg', err2: 'msG2' }, jest.fn()],
    widgetWithNoError: [{}, jest.fn()],
  };
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('render', () => {
    beforeEach(() => {
      jest.spyOn(React, 'useContext').mockReturnValueOnce({});
    });
    test('snapshots: renders as expected when there are no errors', () => {
      jest.spyOn(module, 'showAlert').mockReturnValue(false);
      expect(shallow(<module.ErrorSummary />).snapshot).toMatchSnapshot();
    });
    test('snapshots: renders as expected when there are errors', () => {
      jest.spyOn(module, 'showAlert').mockReturnValue(true);
      expect(shallow(<module.ErrorSummary />).snapshot).toMatchSnapshot();
    });
  });
  describe('hasNoError', () => {
    it('returns true', () => {
      expect(module.hasNoError(errors.widgetWithError)).toEqual(false);
    });
    it('returns false', () => {
      expect(module.hasNoError(errors.widgetWithNoError)).toEqual(true);
    });
  });
  describe('showAlert', () => {
    it('returns true', () => {
      jest.spyOn(module, 'hasNoError').mockReturnValue(false);
      expect(module.showAlert(errors)).toEqual(true);
    });
    it('returns false', () => {
      jest.spyOn(module, 'hasNoError').mockReturnValue(true);
      expect(module.showAlert(errors)).toEqual(false);
    });
  });
});

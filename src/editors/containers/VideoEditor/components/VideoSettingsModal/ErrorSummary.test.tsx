import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import * as mod from './ErrorSummary';

const { ErrorSummary } = mod;

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
      jest.spyOn(mod, 'showAlert').mockReturnValue(false);
      expect(shallow(<ErrorSummary />).snapshot).toMatchSnapshot();
    });
    test('snapshots: renders as expected when there are errors', () => {
      jest.spyOn(mod, 'showAlert').mockReturnValue(true);
      expect(shallow(<ErrorSummary />).snapshot).toMatchSnapshot();
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

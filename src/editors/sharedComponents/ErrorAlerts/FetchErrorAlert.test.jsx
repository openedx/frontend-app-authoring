import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import FetchErrorAlert from './FetchErrorAlert';

jest.mock('../../data/redux', () => ({
  selectors: {
    requests: {
      isFailed: jest.fn((state, params) => ({ isFailed: { state, params } })),
    },
  },
}));

describe('FetchErrorAlert', () => {
  describe('Snapshots', () => {
    test('snapshot:  is ErrorAlert with Message error (ErrorAlert)', () => {
      expect(shallow(<FetchErrorAlert isFetchError />).snapshot).toMatchSnapshot();
    });
  });
});

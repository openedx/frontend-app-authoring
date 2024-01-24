import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../testUtils';
import { selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import { VideoEditor, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('../EditorContainer', () => 'EditorContainer');
jest.mock('./components/VideoEditorModal', () => 'VideoEditorModal');

jest.mock('./hooks', () => ({
  ErrorContext: {
    Provider: 'ErrorContext.Provider',
  },
  errorsHook: jest.fn(() => ({
    error: 'hooks.errorsHook.error',
    validateEntry: jest.fn().mockName('validateEntry'),
  })),
  fetchVideoContent: jest.fn().mockName('fetchVideoContent'),
}));

jest.mock('../../data/redux', () => ({
  selectors: {
    requests: {
      isFinished: jest.fn((state, params) => ({ isFailed: { state, params } })),
    },
    app: {
      isLibrary: jest.fn(state => ({ isLibrary: state })),
    },
  },
}));

jest.mock('@edx/paragon', () => ({
  ...jest.requireActual('@edx/paragon'),
  Spinner: 'Spinner',
}));

describe('VideoEditor', () => {
  const props = {
    onClose: jest.fn().mockName('props.onClose'),
    intl: { formatMessage },
    studioViewFinished: false,
    isLibrary: false,
  };
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<VideoEditor {...props} />).snapshot).toMatchSnapshot();
    });
    test('renders as expected with default behavior', () => {
      expect(shallow(<VideoEditor {...props} studioViewFinished />).snapshot).toMatchSnapshot();
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('studioViewFinished from requests.isFinished', () => {
      expect(
        mapStateToProps(testState).studioViewFinished,
      ).toEqual(selectors.requests.isFinished(testState, { requestKey: RequestKeys.fetchStudioView }));
    });
    test('isLibrary from app.isLibrary', () => {
      expect(
        mapStateToProps(testState).isLibrary,
      ).toEqual(selectors.app.isLibrary(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    test('is empty', () => {
      expect(mapDispatchToProps).toEqual({});
    });
  });
});

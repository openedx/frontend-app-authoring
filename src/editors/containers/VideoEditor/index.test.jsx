import React from 'react';
import { shallow } from 'enzyme';

import { VideoEditor, mapDispatchToProps } from '.';

jest.mock('../EditorContainer', () => 'EditorContainer');
jest.mock('./components/VideoEditorModal', () => 'VideoEditorModal');

jest.mock('./hooks', () => ({
  ErrorContext: jest.fn(),
  errorsHook: jest.fn(() => ({
    error: 'hooks.errorsHook.error',
    validateEntry: jest.fn().mockName('validateEntry'),
  })),
  fetchVideoContent: jest.fn().mockName('fetchVideoContent'),
}));

describe('VideoEditor', () => {
  const props = {
    onClose: jest.fn().mockName('props.onClose'),
  };
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<VideoEditor {...props} />)).toMatchSnapshot();
    });
  });
  describe('mapDispatchToProps', () => {
    test('is empty', () => {
      expect(mapDispatchToProps).toEqual({});
    });
  });
});

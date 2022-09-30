import React from 'react';
import { shallow } from 'enzyme';

import { selectors } from '../../data/redux';
import { errorsHook } from './hooks';
import { VideoEditor, mapStateToProps, mapDispatchToProps } from '.';

jest.mock('../EditorContainer', () => 'EditorContainer');
jest.mock('./components/VideoEditorModal', () => 'VideoEditorModal');

jest.mock('./hooks', () => ({
  errorsHook: jest.fn(() => ({
    error: 'hooks.errorsHook.error',
    validateEntry: jest.fn().mockName('validateEntry'),
  })),
}));

jest.mock('../../data/redux', () => ({
  selectors: {
    video: {
      videoSettings: state => ({ videoSettings: { state } }),
    },
  },
}));

describe('VideoEditor', () => {
  const props = {
    onClose: jest.fn().mockName('props.onClose'),
    // redux
    videoSettings: 'vIdEOsETtings',
  };
  errorsHook.mockReturnValue({
    error: 'errORsHooKErroR',
    validateEntry: jest.fn().mockName('validateEntry'),
  });
  describe('snapshots', () => {
    test('renders as expected with default behavior', () => {
      expect(shallow(<VideoEditor {...props} />)).toMatchSnapshot();
    });
  });

  describe('mapStateToProps', () => {
    const testState = { some: 'testState' };
    test('loads videoSettings from videoSettings selector', () => {
      expect(mapStateToProps(testState).videoSettings).toEqual(
        selectors.video.videoSettings(testState),
      );
    });
  });

  describe('mapDispatchToProps', () => {
    test('is empty', () => {
      expect(mapDispatchToProps).toEqual({});
    });
  });
});

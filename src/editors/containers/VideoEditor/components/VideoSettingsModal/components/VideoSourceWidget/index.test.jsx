import React from 'react';
import { dispatch } from 'react-redux';
import { shallow } from 'enzyme';

import { formatMessage } from '../../../../../../../testUtils';
import { VideoSourceWidget } from '.';
import * as hooks from './hooks';

jest.mock('react-redux', () => {
  const dispatchFn = jest.fn();
  return {
    ...jest.requireActual('react-redux'),
    dispatch: dispatchFn,
    useDispatch: jest.fn(() => dispatchFn),
  };
});

jest.mock('../hooks', () => ({
  selectorKeys: ['soMEkEy'],
  widgetValues: jest.fn().mockReturnValue({
    videoId: { onChange: jest.fn(), onBlur: jest.fn(), local: '' },
    videoSource: { onChange: jest.fn(), onBlur: jest.fn(), local: '' },
    fallbackVideos: {
      formValue: ['somEUrL'],
      onChange: jest.fn(),
      onBlur: jest.fn(),
      local: '',
    },
    allowVideoDownloads: { local: false, onCheckedChange: jest.fn() },
  }),
}));

jest.mock('./hooks', () => ({
  sourceHooks: jest.fn().mockReturnValue({
    updateVideoId: (args) => ({ updateVideoId: args }),
    updateVideoURL: (args) => ({ updateVideoURL: args }),
  }),
  fallbackHooks: jest.fn().mockReturnValue({
    addFallbackVideo: jest.fn().mockName('addFallbackVideo'),
    deleteFallbackVideo: jest.fn().mockName('deleteFallbackVideo'),
  }),
}));

describe('VideoSourceWidget', () => {
  const props = {
    // inject
    intl: { formatMessage },
  };

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      expect(
        shallow(<VideoSourceWidget {...props} />),
      ).toMatchSnapshot();
    });
  });

  describe('behavior inspection', () => {
    let el;
    let hook;
    beforeEach(() => {
      el = shallow(<VideoSourceWidget {...props} />);
      hook = hooks.sourceHooks({ dispatch });
    });
    test('updateVideoId is tied to id field onBlur', () => {
      const expected = hook.updateVideoId;
      expect(el
        // eslint-disable-next-line
        .children().at(0).children().at(0).children().at(0)
        .props().onBlur).toEqual(expected);
    });
    test('updateVideoURL is tied to url field onBlur', () => {
      const expected = hook.updateVideoURL;
      expect(el
        // eslint-disable-next-line
        .children().at(0).children().at(0).children().at(2)
        .props().onBlur).toEqual(expected);
    });
  });
});

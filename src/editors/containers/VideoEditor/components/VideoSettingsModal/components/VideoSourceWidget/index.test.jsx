import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { dispatch } from 'react-redux';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../../../../testUtils';
import { VideoSourceWidgetInternal as VideoSourceWidget } from '.';
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
    allowVideoSharing: { local: false, onCheckedChange: jest.fn() },
  }),
}));

jest.mock('./hooks', () => ({
  videoIdChangeAlert: jest.fn().mockReturnValue({
    videoIdChangeAlert: {
      set: (args) => ({ set: args }),
      show: false,
      dismiss: (args) => ({ dismiss: args }),
    },
  }),
  sourceHooks: jest.fn().mockReturnValue({
    updateVideoId: (args) => ({ updateVideoId: args }),
    updateVideoURL: jest.fn().mockName('updateVideoURL'),
  }),
  fallbackHooks: jest.fn().mockReturnValue({
    addFallbackVideo: jest.fn().mockName('addFallbackVideo'),
    deleteFallbackVideo: jest.fn().mockName('deleteFallbackVideo'),
  }),
}));

jest.mock('../../../../../../data/redux', () => ({
  selectors: {
    video: {
      allow: jest.fn(state => ({ allowTranscriptImport: state })),
    },
    requests: {
      isFailed: jest.fn(state => ({ isFailed: state })),
    },
  },
}));

describe('VideoSourceWidget', () => {
  const props = {
    // inject
    intl: { formatMessage },
    // redux
    videoSharingEnabledForCourse: false,
  };

  describe('snapshots', () => {
    describe('snapshots: renders as expected with', () => {
      it('default props', () => {
        expect(
          shallow(<VideoSourceWidget {...props} />).snapshot,
        ).toMatchSnapshot();
      });
      it('videoSharingEnabledForCourse=true', () => {
        const newProps = { ...props, videoSharingEnabledForCourse: true };
        expect(
          shallow(<VideoSourceWidget {...newProps} />).snapshot,
        ).toMatchSnapshot();
      });
    });
  });

  describe('behavior inspection', () => {
    let el;
    let hook;
    beforeEach(() => {
      hook = hooks.sourceHooks({ dispatch, previousVideoId: 'someVideoId', setAlert: jest.fn() });
      el = shallow(<VideoSourceWidget {...props} />);
    });
    test('updateVideoId is tied to id field onBlur', () => {
      const expected = hook.updateVideoId;
      expect(el
        // eslint-disable-next-line
        .shallowWrapper.props.children[1].props.children[0].props.children[0]
        .props.onBlur).toEqual(expected);
    });
    test('updateVideoURL is tied to url field onBlur', () => {
      const control = el.shallowWrapper.props.children[1].props.children[1].props.children[0];
      expect(control.props.floatingLabel).toEqual('Video URL');
      control.props.onBlur('onBlur event');
      expect(hook.updateVideoURL).toHaveBeenCalledWith('onBlur event', '');
    });
  });
});

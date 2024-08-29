import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { useDispatch } from 'react-redux';
import { shallow } from '@edx/react-unit-test-utils';
import * as hooks from './hooks';
import VideoSelector from './VideoSelector';

jest.mock('./hooks', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('./containers/VideoGallery', () => 'VideoGallery');

const props = {
  blockId: 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4',
  learningContextId: 'course-v1:edX+DemoX+Demo_Course',
  lmsEndpointUrl: 'evenfakerurl.com',
  studioEndpointUrl: 'fakeurl.com',
};

const initData = {
  blockType: 'video',
  ...props,
};

describe('Video Selector', () => {
  describe('render', () => {
    test('rendering correctly with expected Input', () => {
      expect(shallow(<VideoSelector {...props} />).snapshot).toMatchSnapshot();
    });
  });
  describe('behavior', () => {
    it('calls initializeApp hook with dispatch, and passed data', () => {
      shallow(<VideoSelector {...props} />);
      expect(hooks.initializeApp).toHaveBeenCalledWith({
        dispatch: useDispatch(),
        data: initData,
      });
    });
  });
});

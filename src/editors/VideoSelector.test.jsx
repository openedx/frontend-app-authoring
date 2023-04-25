import React from 'react';
import { useDispatch } from 'react-redux';
import { shallow } from 'enzyme';
import * as hooks from './hooks';
import VideoSelector from './VideoSelector';

jest.mock('./hooks', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('./containers/VideoGallery', () => 'VideoGallery');

const props = {
  learningContextId: 'course-v1:edX+DemoX+Demo_Course',
  lmsEndpointUrl: 'evenfakerurl.com',
  studioEndpointUrl: 'fakeurl.com',
};

const initData = {
  blockId: '',
  blockType: 'video',
  ...props,
};

describe('Video Selector', () => {
  describe('render', () => {
    test('rendering correctly with expected Input', () => {
      expect(shallow(<VideoSelector {...props} />)).toMatchSnapshot();
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

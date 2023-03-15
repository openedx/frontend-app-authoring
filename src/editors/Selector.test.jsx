import React from 'react';
import { useDispatch } from 'react-redux';
import { shallow } from 'enzyme';
import * as hooks from './hooks';
import Selector from './Selector';

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

describe('Editor', () => {
  describe('render', () => {
    test('rendering correctly with expected Input', () => {
      expect(shallow(<Selector {...props} />)).toMatchSnapshot();
    });
  });
  describe('behavior', () => {
    it('calls initializeApp hook with dispatch, and passed data', () => {
      shallow(<Selector {...props} />);
      expect(hooks.initializeApp).toHaveBeenCalledWith({
        dispatch: useDispatch(),
        data: initData,
      });
    });
  });
});

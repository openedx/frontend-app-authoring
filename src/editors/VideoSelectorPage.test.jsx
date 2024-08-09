import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import VideoSelectorPage from './VideoSelectorPage';

const props = {
  blockId: 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4',
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  lmsEndpointUrl: 'evenfakerurl.com',
  studioEndpointUrl: 'fakeurl.com',
};

jest.mock('react-redux', () => ({
  Provider: 'Provider',
  connect: (mapStateToProps, mapDispatchToProps) => (component) => ({
    mapStateToProps,
    mapDispatchToProps,
    component,
  }),
}));
jest.mock('./VideoSelector', () => 'VideoSelector');

describe('Video Selector Page', () => {
  describe('snapshots', () => {
    test('rendering correctly with expected Input', () => {
      expect(shallow(<VideoSelectorPage {...props} />).snapshot).toMatchSnapshot();
    });
    test('rendering with props to null', () => {
      expect(shallow(<VideoSelectorPage />).snapshot).toMatchSnapshot();
    });
  });
});

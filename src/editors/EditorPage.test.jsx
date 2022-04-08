import React from 'react';
import { shallow } from 'enzyme';
import EditorPage from './EditorPage';

const props = {
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  blockType: 'html',
  blockId: 'block-v1:edX+DemoX+Demo_Course+type@html+block@030e35c4756a4ddc8d40b95fbbfff4d4',
  lmsEndpointUrl: 'evenfakerurl.com',
  studioEndpointUrl: 'fakeurl.com',
};
jest.mock('react-redux', () => ({
  Provider: 'Provider',
}));
jest.mock('./Editor', () => 'Editor');

describe('Editor Page', () => {
  describe('snapshots', () => {
    test('rendering correctly with expected Input', () => {
      expect(shallow(<EditorPage {...props} />)).toMatchSnapshot();
    });
  });
});

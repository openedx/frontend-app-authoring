import React from 'react';
import { shallow } from 'enzyme';
import SelectorPage from './SelectorPage';

const props = {
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  lmsEndpointUrl: 'evenfakerurl.com',
  studioEndpointUrl: 'fakeurl.com',
};

jest.mock('react-redux', () => ({
  Provider: 'Provider',
}));
jest.mock('./Selector', () => 'Selector');

describe('Selector Page', () => {
  describe('snapshots', () => {
    test('rendering correctly with expected Input', () => {
      expect(shallow(<SelectorPage {...props} />)).toMatchSnapshot();
    });
    test('rendering with props to null', () => {
      expect(shallow(<SelectorPage />)).toMatchSnapshot();
    });
  });
});

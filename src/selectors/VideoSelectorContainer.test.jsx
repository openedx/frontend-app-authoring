import React from 'react';
import { shallow } from 'enzyme';
import VideoSelectorContainer from './VideoSelectorContainer';

jest.mock('@edx/frontend-lib-content-components', () => ({ VideoSelectorPage: () => 'HeaderTitle' }));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'), // use actual for all non-hook parts
  useParams: () => ({
    blockId: 'company-id1',
    blockType: 'html',
  }),
}));

const props = { courseId: 'cOuRsEId' };

describe('Video Selector Container', () => {
  describe('snapshots', () => {
    test('rendering correctly with expected Input', () => {
      expect(shallow(<VideoSelectorContainer {...props} />)).toMatchSnapshot();
    });
  });
});

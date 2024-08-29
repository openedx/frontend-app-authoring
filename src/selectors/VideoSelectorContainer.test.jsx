import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import VideoSelectorContainer from './VideoSelectorContainer';

jest.mock('../editors/VideoSelectorPage', () => ({
  default: function VideoSelectorPage() { return 'HeaderTitle'; },
  __esModule: true, // Required to mock a default export
}));

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
      expect(shallow(<VideoSelectorContainer {...props} />).snapshot).toMatchSnapshot();
    });
  });
});

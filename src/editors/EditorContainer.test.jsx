import React from 'react';
import { shallow } from 'enzyme';
import EditorContainer from './EditorContainer';

jest.mock('@edx/frontend-lib-content-components', () => ({ EditorPage: () => 'HeaderTitle' }));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'), // use actual for all non-hook parts
  useParams: () => ({
    blockId: 'company-id1',
    blockType: 'html',
  }),
}));

const props = { courseId: 'cOuRsEId' };

describe('Editor Container', () => {
  describe('snapshots', () => {
    test('rendering correctly with expected Input', () => {
      expect(shallow(<EditorContainer {...props} />)).toMatchSnapshot();
    });
  });
});

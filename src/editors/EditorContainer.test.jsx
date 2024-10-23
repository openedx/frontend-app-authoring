import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';
import EditorContainer from './EditorContainer';

const mockPathname = '/editor/';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    blockId: 'company-id1',
    blockType: 'html',
  }),
  useLocation: () => ({
    pathname: mockPathname,
  }),
  useSearchParams: () => [{
    get: () => 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
  }],
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const props = { learningContextId: 'cOuRsEId' };

describe('Editor Container', () => {
  describe('snapshots', () => {
    test('rendering correctly with expected Input', () => {
      expect(shallow(<EditorContainer {...props} />).snapshot).toMatchSnapshot();
    });
  });
});

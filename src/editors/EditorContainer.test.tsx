import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import {
  render, screen, initializeMocks, fireEvent, act,
} from '@src/testUtils';
import EditorContainer from './EditorContainer';
import { mockWaffleFlags } from '../data/apiHooks.mock';
import editorCmsApi from './data/services/cms/api';

mockWaffleFlags();

const mockPathname = '/editor/';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    blockId: 'block-v1:Org+TS100+24+type@fake+block@123456fake',
    blockType: 'fake',
  }),
  useLocation: () => ({
    pathname: mockPathname,
  }),
  useSearchParams: () => [{
    get: () => 'lb:Axim:TEST:html:571fe018-f3ce-45c9-8f53-5dafcb422fdd',
  }],
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: () => ({
    useReactMarkdownEditor: true, // or false depending on the test
  }),
}));

// Mock this plugins component:
jest.mock('frontend-components-tinymce-advanced-plugins', () => ({ a11ycheckerCss: '' }));
// Always mock out the "fetch course images" endpoint:
jest.spyOn(editorCmsApi, 'fetchCourseImages').mockImplementation(async () => ( // eslint-disable-next-line
  { data: { assets: [], start: 0, end: 0, page: 0, pageSize: 50, totalCount: 0 } }
));
// Mock out the 'get ancestors' API:
jest.spyOn(editorCmsApi, 'fetchByUnitId').mockImplementation(async () => ({
  status: 200,
  data: {
    ancestors: [{
      id: 'block-v1:Org+TS100+24+type@vertical+block@parent',
      display_name: 'You-Knit? The Test Unit',
      category: 'vertical',
      has_children: true,
    }],
  },
}));
jest.mock('../library-authoring/LibraryBlock', () => ({
  LibraryBlock: jest.fn(() => (<div>Advanced Editor Iframe</div>)),
}));

const props = { learningContextId: 'cOuRsEId' };

describe('EditorContainer', () => {
  beforeEach(() => {
    initializeMocks();
    jest.spyOn(editorCmsApi, 'fetchBlockById').mockImplementationOnce(async () => (
      {
        status: 200,
        data: {
          display_name: 'Fake Un-editable Block', category: 'fake', metadata: {}, data: '',
        },
      }
    ));
  });

  test('render component', () => {
    render(<EditorContainer {...props} />);
    expect(screen.getByText('View in Library')).toBeInTheDocument();
    expect(screen.getByText('Advanced Editor Iframe')).toBeInTheDocument();
  });

  test('should call onClose param when receiving "cancel-clicked" message', () => {
    const onCloseMock = jest.fn();
    render(<EditorContainer {...props} onClose={onCloseMock} />);
    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'xblock-event',
        eventName: 'cancel',
      },
      origin: getConfig().STUDIO_BASE_URL,
    });

    act(() => {
      window.dispatchEvent(messageEvent);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Discard Changes and Exit' }));
    expect(onCloseMock).toHaveBeenCalled();
  });
});

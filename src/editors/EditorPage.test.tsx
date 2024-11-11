import { snakeCaseObject } from '@edx/frontend-platform';
import {
  render,
  screen,
  initializeMocks,
} from '../testUtils';
import editorCmsApi from './data/services/cms/api';

import EditorPage from './EditorPage';

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

const defaultPropsHtml = {
  blockId: 'block-v1:Org+TS100+24+type@html+block@123456html',
  blockType: 'html',
  courseId: 'course-v1:Org+TS100+24',
  lmsEndpointUrl: 'http://lms.test.none/',
  studioEndpointUrl: 'http://cms.test.none/',
  onClose: jest.fn(),
  fullScreen: false,
};
const fieldsHtml = {
  displayName: 'Introduction to Testing',
  data: '<p>This is a text component which uses <strong>HTML</strong>.</p>',
  metadata: { displayName: 'Introduction to Testing' },
};

describe('EditorPage', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('it can display the Text (html) editor in a modal', async () => {
    jest.spyOn(editorCmsApi, 'fetchBlockById').mockImplementationOnce(async () => (
      { status: 200, data: snakeCaseObject(fieldsHtml) }
    ));

    render(<EditorPage {...defaultPropsHtml} />);

    // Then the editor should open
    expect(await screen.findByRole('heading', { name: /Introduction to Testing/ })).toBeInTheDocument();

    const modalElement = screen.getByRole('dialog');
    expect(modalElement.classList).toContain('pgn__modal');
    expect(modalElement.classList).toContain('pgn__modal-xl');
    expect(modalElement.classList).not.toContain('pgn__modal-fullscreen');
  });

  test('it can display the Text (html) editor as a full page (when coming from the legacy UI)', async () => {
    jest.spyOn(editorCmsApi, 'fetchBlockById').mockImplementationOnce(async () => (
      { status: 200, data: snakeCaseObject(fieldsHtml) }
    ));

    render(<EditorPage {...defaultPropsHtml} fullScreen />);

    // Then the editor should open
    expect(await screen.findByRole('heading', { name: /Introduction to Testing/ })).toBeInTheDocument();

    const modalElement = screen.getByRole('dialog');
    expect(modalElement.classList).toContain('pgn__modal-fullscreen');
    expect(modalElement.classList).not.toContain('pgn__modal');
    expect(modalElement.classList).not.toContain('pgn__modal-xl');
  });

  test('it shows an error message if there is no corresponding editor', async () => {
    // We can edit 'html', 'problem', and 'video' blocks.
    // But if we try to edit some other type, say 'fake', we should get an error:
    jest.spyOn(editorCmsApi, 'fetchBlockById').mockImplementationOnce(async () => ( // eslint-disable-next-line
      { status: 200, data: { display_name: 'Fake Un-editable Block', category: 'fake', metadata: {}, data: '' } }
    ));

    const defaultPropsFake = {
      ...defaultPropsHtml,
      blockId: 'block-v1:Org+TS100+24+type@fake+block@123456fake',
      blockType: 'fake',
    };
    render(<EditorPage {...defaultPropsFake} />);

    expect(await screen.findByText('Error: Could Not find Editor')).toBeInTheDocument();
  });
});

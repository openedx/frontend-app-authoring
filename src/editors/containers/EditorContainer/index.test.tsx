import { snakeCaseObject } from '@edx/frontend-platform';
import {
  render,
  screen,
  initializeMocks,
  fireEvent,
  waitFor,
} from '../../../testUtils';
import editorCmsApi from '../../data/services/cms/api';

import EditorPage from '../../EditorPage';

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

const isDirtyMock = jest.fn();
jest.mock('../TextEditor/hooks', () => ({
  ...jest.requireActual('../TextEditor/hooks'),
  isDirty: () => isDirtyMock,
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

describe('EditorContainer', () => {
  let mockEvent: Event;

  beforeEach(() => {
    initializeMocks();
    mockEvent = new Event('beforeunload');
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
    jest.spyOn(mockEvent, 'preventDefault');
    Object.defineProperty(mockEvent, 'returnValue', { writable: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('it displays a confirmation dialog when closing the editor modal if data is changed', async () => {
    jest.spyOn(editorCmsApi, 'fetchBlockById').mockImplementationOnce(async () => (
      { status: 200, data: snakeCaseObject(fieldsHtml) }
    ));

    isDirtyMock.mockReturnValue(true);
    render(<EditorPage {...defaultPropsHtml} />);

    // Then the editor should open
    expect(await screen.findByRole('heading', { name: /Introduction to Testing/ })).toBeInTheDocument();

    // Assert the "are you sure?" message isn't visible yet
    const confirmMessage = /Are you sure you want to exit the editor/;
    expect(screen.queryByText(confirmMessage)).not.toBeInTheDocument();

    // Find and click the close button
    const closeButton = await screen.findByRole('button', { name: 'Exit the editor' });
    fireEvent.click(closeButton);
    // Now we should see the confirmation message:
    expect(await screen.findByText(confirmMessage)).toBeInTheDocument();
    expect(defaultPropsHtml.onClose).not.toHaveBeenCalled();

    // Should close modal if cancelled
    const cancelBtn = await screen.findByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(defaultPropsHtml.onClose).not.toHaveBeenCalled();

    // open modal again
    fireEvent.click(closeButton);
    // And can confirm the cancelation:
    const confirmButton = await screen.findByRole('button', { name: 'OK' });
    fireEvent.click(confirmButton);
    expect(defaultPropsHtml.onClose).toHaveBeenCalled();
    window.dispatchEvent(mockEvent);
    // should not be blocked by beforeunload event as the page was unloaded using close/cancel option
    expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  test('it does not display any confirmation dialog when closing the editor modal if data is not changed', async () => {
    jest.spyOn(editorCmsApi, 'fetchBlockById').mockImplementationOnce(async () => (
      { status: 200, data: snakeCaseObject(fieldsHtml) }
    ));

    isDirtyMock.mockReturnValue(false);
    render(<EditorPage {...defaultPropsHtml} />);

    // Then the editor should open
    expect(await screen.findByRole('heading', { name: /Introduction to Testing/ })).toBeInTheDocument();

    // Assert the "are you sure?" message isn't visible yet
    const confirmMessage = /Are you sure you want to exit the editor/;
    expect(screen.queryByText(confirmMessage)).not.toBeInTheDocument();

    // Find and click the close button
    const closeButton = await screen.findByRole('button', { name: 'Exit the editor' });
    fireEvent.click(closeButton);
    // Even now we should not see the confirmation message as data is not dirty, i.e. not changed:
    expect(screen.queryByText(confirmMessage)).not.toBeInTheDocument();

    // And onClose is directly called
    expect(defaultPropsHtml.onClose).toHaveBeenCalled();
  });

  test('it disables the save button until the fields have been loaded', async () => {
    // Mock that loading the block data has begun but not completed yet:
    let resolver: (result: { data: any }) => void;
    jest.spyOn(editorCmsApi, 'fetchBlockById').mockImplementationOnce(() => new Promise((r) => { resolver = r; }));

    render(<EditorPage {...defaultPropsHtml} />);

    // Then the editor should open. The "Save" button should be disabled
    const saveButton = await screen.findByRole('button', { name: /Save changes and return/ });
    expect(saveButton).toBeDisabled();

    // Now complete the loading of the data:
    await waitFor(() => expect(resolver).not.toBeUndefined());
    resolver!({ data: snakeCaseObject(fieldsHtml) });

    // Now the save button should be active:
    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });

  test('beforeunload event is triggered on page unload if data is changed', async () => {
    jest.spyOn(editorCmsApi, 'fetchBlockById').mockImplementationOnce(async () => (
      { status: 200, data: snakeCaseObject(fieldsHtml) }
    ));

    isDirtyMock.mockReturnValue(true);
    render(<EditorPage {...defaultPropsHtml} />);

    // Then the editor should open
    expect(await screen.findByRole('heading', { name: /Introduction to Testing/ })).toBeInTheDocument();
    // on beforeunload event block user
    window.dispatchEvent(mockEvent);
    expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.returnValue).toBe(true);
  });
});

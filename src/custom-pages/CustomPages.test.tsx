import ReactDOM from 'react-dom';

import {
  initializeMocks,
  fireEvent,
  screen,
  waitFor,
  render,
} from '@src/testUtils';
import { getApiWaffleFlagsUrl } from '@src/data/api';
import { useCourseDetails } from '@src/data/apiHooks';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import CustomPages from './CustomPages';
import { getApiBaseUrl, getTabHandlerUrl } from './data/api';
import messages from './messages';

let axiosMock;
// @ts-ignore
ReactDOM.createPortal = jest.fn(node => node);

const courseId = 'course-v1:edX+DemoX+Demo_Course';

const generateFetchPageApiResponse = () => [{
  type: 'static_tab',
  title: null,
  is_hideable: false,
  is_hidden: false,
  is_movable: true,
  course_staff_only: false,
  name: 'test',
  tab_id: 'static_tab_1',
  settings: { url_slug: '1' },
  id: 'mOckID1',
}];

const generateNewPageApiResponse = () => ({
  locator: 'mOckID2',
  courseKey: courseId,
});

jest.mock('@src/data/apiHooks', () => ({
  ...jest.requireActual('@src/data/apiHooks'),
  useCourseDetails: jest.fn(),
}));

const mockCourseDetails = {
  name: 'Test Course',
  start: '2024-01-01T00:00:00Z',
};

const renderComponent = () => {
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CustomPages />
    </CourseAuthoringProvider>,
  );
};

describe('CustomPages', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, {});
    (useCourseDetails as jest.Mock).mockReturnValue({
      data: mockCourseDetails,
      status: 'successful',
    });
  });

  it('should render placeholder on 403', async () => {
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(403);
    renderComponent();
    expect(await screen.findByTestId('under-construction-placeholder')).toBeVisible();
  });

  it('should have breadcrumbs', async () => {
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    renderComponent();
    expect(await screen.findByLabelText('Custom Page breadcrumbs')).toBeVisible();
  });

  it('should contain header row with title, add button and view live button', async () => {
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    renderComponent();
    expect(await screen.findByText(messages.heading.defaultMessage)).toBeVisible();
    expect(screen.getByTestId('header-add-button')).toBeVisible();
    expect(screen.getByTestId('header-view-live-button')).toBeVisible();
  });

  it('should add new page when "add a new page button" is clicked', async () => {
    const xblockAddUrl = `${getApiBaseUrl()}/xblock/`;
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    axiosMock.onPut(xblockAddUrl).reply(200, generateNewPageApiResponse());

    renderComponent();
    const addButton = await screen.findByTestId('body-add-button');
    expect(addButton).toBeVisible();

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should open student view modal when button is clicked', async () => {
    axiosMock.onGet(getTabHandlerUrl(courseId)).reply(200, generateFetchPageApiResponse());
    renderComponent();

    const viewButton = await screen.findByTestId('student-view-example-button');
    expect(viewButton).toBeVisible();
    expect(screen.queryByText(messages.studentViewModalTitle.defaultMessage)).toBeNull();

    fireEvent.click(viewButton);
    expect(screen.getByText(messages.studentViewModalTitle.defaultMessage)).toBeVisible();
  });
});

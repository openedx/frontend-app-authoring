import {
  initializeMocks,
  render,
  fireEvent,
  screen,
} from '@src/testUtils';
import genericMessages from '@src/generic/help-sidebar/messages';
import { DATE_FORMAT } from '@src/constants';
import { getCourseSettingsApiUrl } from '@src/data/api';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { useCourseUserPermissions } from '@src/authz/hooks';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { courseDetailsMock, courseSettingsMock } from './__mocks__';
import { getCourseDetailsApiUrl } from './data/api';
import creditMessages from './credit-section/messages';
import pacingMessages from './pacing-section/messages';
import basicMessages from './basic-section/messages';
import scheduleMessages from './schedule-section/messages';
import messages from './messages';
import ScheduleAndDetails from '.';

jest.mock('@src/authz/hooks', () => ({
  useCourseUserPermissions: jest.fn().mockReturnValue({
    isLoading: false,
    isAuthzEnabled: true,
    canViewScheduleAndDetails: true,
    canEditSchedule: true,
    canEditDetails: true,
  }),
}));

const mockPermissions = (overrides = {}) =>
  jest.mocked(useCourseUserPermissions).mockReturnValue({
    isLoading: false,
    isAuthzEnabled: true,
    canViewScheduleAndDetails: true,
    canEditSchedule: true,
    canEditDetails: true,
    ...overrides,
  });

let axiosMock;
const courseId = '123';

// Mock the tinymce lib
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'foo bar',
  };
});

jest.mock('../editors/sharedComponents/TinyMceWidget', () => ({
  __esModule: true, // Required to mock a default export
  default: () => <div>Widget</div>,
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

// Mock the TextareaAutosize component
jest.mock(
  'react-textarea-autosize',
  () => jest.fn((props) => <textarea {...props} onFocus={() => {}} onBlur={() => {}} />),
);

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <ScheduleAndDetails />
    </CourseAuthoringProvider>,
  );

describe('<ScheduleAndDetails />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getCourseDetailsApiUrl(courseId))
      .reply(200, courseDetailsMock);
    axiosMock
      .onGet(getCourseSettingsApiUrl(courseId))
      .reply(200, courseSettingsMock);
    axiosMock
      .onPut(getCourseDetailsApiUrl(courseId))
      .reply(200);
  });

  it('should render without errors', async () => {
    renderComponent();
    expect(
      await screen.findByText(pacingMessages.pacingTitle.defaultMessage),
    ).toBeInTheDocument();
    const scheduleAndDetailElements = screen.getAllByText(messages.headingTitle.defaultMessage);
    const scheduleAndDetailTitle = scheduleAndDetailElements[0];
    expect(scheduleAndDetailTitle).toBeInTheDocument();
    expect(
      screen.getByText(basicMessages.basicTitle.defaultMessage),
    ).toBeInTheDocument();
    expect(
      screen.getByText(creditMessages.creditTitle.defaultMessage),
    ).toBeInTheDocument();
    expect(
      screen.getByText(scheduleMessages.scheduleTitle.defaultMessage),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', {
        name: genericMessages.sidebarTitleOther.defaultMessage,
      }),
    ).toBeInTheDocument();
  });

  it('should hide credit section with condition', async () => {
    const updatedResponse = {
      ...courseSettingsMock,
      creditEligibilityEnabled: false,
      isCreditCourse: false,
    };
    axiosMock
      .onGet(getCourseSettingsApiUrl(courseId))
      .reply(200, updatedResponse);

    renderComponent();
    expect(
      screen.queryAllByText(creditMessages.creditTitle.defaultMessage).length,
    ).toBe(0);
  });

  it('should show save alert onChange ', async () => {
    renderComponent();
    const inputs = await screen.findAllByPlaceholderText(DATE_FORMAT.toLocaleUpperCase());
    // @ts-ignore
    fireEvent.change(inputs[0], { target: { value: '06/16/2023' } });

    expect(
      screen.getByText(messages.alertWarning.defaultMessage),
    ).toBeInTheDocument();
  });

  it('should display a success message when course details saves', async () => {
    renderComponent();
    const inputs = await screen.findAllByPlaceholderText(DATE_FORMAT.toLocaleUpperCase());
    fireEvent.change(inputs[0], { target: { value: '06/16/2023' } });
    fireEvent.click(await screen.findByText(messages.buttonSaveText.defaultMessage));
    expect(await screen.findByText(messages.alertSuccess.defaultMessage)).toBeInTheDocument();
  });

  it('should display an error when GET CourseDetails fails', async () => {
    axiosMock
      .onGet(getCourseDetailsApiUrl(courseId))
      .reply(404, 'error');
    renderComponent();
    expect(await screen.findByText(messages.alertLoadFail.defaultMessage)).toBeInTheDocument();
  });

  it('should display an error when GET CourseSettings fails', async () => {
    axiosMock
      .onGet(getCourseSettingsApiUrl(courseId))
      .reply(404, 'error');
    renderComponent();
    expect(await screen.findByText(messages.alertLoadFail.defaultMessage)).toBeInTheDocument();
  });

  it('should display an error when PUT CourseDetails fails', async () => {
    axiosMock
      .onPut(getCourseDetailsApiUrl(courseId))
      .reply(404, 'error');
    renderComponent();
    const inputs = await screen.findAllByPlaceholderText(DATE_FORMAT.toLocaleUpperCase());
    fireEvent.change(inputs[0], { target: { value: '06/16/2023' } });
    fireEvent.click(await screen.findByText(messages.buttonSaveText.defaultMessage));
    expect(await screen.findByText(messages.alertFail.defaultMessage)).toBeInTheDocument();
  });
});

describe('<ScheduleAndDetails /> permissions', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    axiosMock.onGet(getCourseDetailsApiUrl(courseId)).reply(200, courseDetailsMock);
    axiosMock.onGet(getCourseSettingsApiUrl(courseId)).reply(200, courseSettingsMock);
    axiosMock.onPut(getCourseDetailsApiUrl(courseId)).reply(200);
    mockPermissions();
  });

  it('renders normally when authz flag is disabled (no regression)', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: false });
    renderComponent();
    expect((await screen.findAllByText(messages.headingTitle.defaultMessage)).length).toBeGreaterThan(0);
  });

  it('renders normally when user has all permissions', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    renderComponent();
    expect((await screen.findAllByText(messages.headingTitle.defaultMessage)).length).toBeGreaterThan(0);
  });

  it('shows PermissionDeniedAlert when user lacks view permission', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    mockPermissions({ canViewScheduleAndDetails: false, canEditSchedule: false, canEditDetails: false });
    renderComponent();
    expect(await screen.findByTestId('permissionDeniedAlert')).toBeInTheDocument();
  });

  it('disables schedule date inputs when user lacks edit_schedule permission', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    mockPermissions({ canEditSchedule: false });
    renderComponent();
    const dateInputs = await screen.findAllByPlaceholderText(DATE_FORMAT.toLocaleUpperCase());
    dateInputs.forEach((input) => expect(input).toBeDisabled());
  });

  it('disables pacing and details inputs when user lacks edit_details permission', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    mockPermissions({ canEditDetails: false });
    renderComponent();
    const radios = await screen.findAllByRole('radio');
    radios.forEach((radio) => expect(radio).toBeDisabled());
  });

  it('save button cannot be triggered when user has no edit permissions', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    mockPermissions({ canEditSchedule: false, canEditDetails: false });
    renderComponent();
    // Wait for page to load
    const dateInputs = await screen.findAllByPlaceholderText(DATE_FORMAT.toLocaleUpperCase());
    // All date inputs must be disabled (no edit_schedule permission)
    dateInputs.forEach((input) => expect(input).toBeDisabled());
    // No changes can be made so the save button never appears
    expect(screen.queryByText(messages.buttonSaveText.defaultMessage)).not.toBeInTheDocument();
  });
});

// @ts-check
import {
  act,
  initializeMocks,
  render,
  waitFor,
  fireEvent,
} from '../testUtils';
import { executeThunk } from '../utils';
import { courseDetailsMock, courseSettingsMock } from './__mocks__';
import { getCourseDetailsApiUrl, getCourseSettingsApiUrl } from './data/api';
import { updateCourseDetailsQuery } from './data/thunks';
import { DATE_FORMAT } from '../constants';
import creditMessages from './credit-section/messages';
import pacingMessages from './pacing-section/messages';
import basicMessages from './basic-section/messages';
import scheduleMessages from './schedule-section/messages';
import genericMessages from '../generic/help-sidebar/messages';
import messages from './messages';
import ScheduleAndDetails from '.';

let axiosMock;
let store;
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
jest.mock('react-textarea-autosize', () => jest.fn((props) => (
  <textarea {...props} onFocus={() => {}} onBlur={() => {}} />
)));

describe('<ScheduleAndDetails />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    store = mocks.reduxStore;
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
    const { getByText, getByRole, getAllByText } = render(<ScheduleAndDetails courseId={courseId} />);
    await waitFor(() => {
      const scheduleAndDetailElements = getAllByText(messages.headingTitle.defaultMessage);
      const scheduleAndDetailTitle = scheduleAndDetailElements[0];
      expect(
        getByText(pacingMessages.pacingTitle.defaultMessage),
      ).toBeInTheDocument();
      expect(scheduleAndDetailTitle).toBeInTheDocument();
      expect(
        getByText(basicMessages.basicTitle.defaultMessage),
      ).toBeInTheDocument();
      expect(
        getByText(creditMessages.creditTitle.defaultMessage),
      ).toBeInTheDocument();
      expect(
        getByText(scheduleMessages.scheduleTitle.defaultMessage),
      ).toBeInTheDocument();
      expect(
        getByRole('navigation', {
          name: genericMessages.sidebarTitleOther.defaultMessage,
        }),
      ).toBeInTheDocument();
    });
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

    const { queryAllByText } = render(<ScheduleAndDetails courseId={courseId} />);
    await waitFor(() => {
      expect(
        queryAllByText(creditMessages.creditTitle.defaultMessage).length,
      ).toBe(0);
    });
  });

  it('should show save alert onChange ', async () => {
    const { getAllByPlaceholderText, getByText } = render(
      <ScheduleAndDetails courseId={courseId} />,
    );
    let inputs;
    await waitFor(() => {
      inputs = getAllByPlaceholderText(DATE_FORMAT.toLocaleUpperCase());
    });
    // @ts-ignore
    fireEvent.change(inputs[0], { target: { value: '06/16/2023' } });

    expect(
      getByText(messages.alertWarning.defaultMessage),
    ).toBeInTheDocument();
  });

  it('should display a success message when course details saves', async () => {
    const { getByText } = render(<ScheduleAndDetails courseId={courseId} />);
    await waitFor(() => {
      executeThunk(updateCourseDetailsQuery(courseId, 'DaTa'), store.dispatch);
    });
    expect(getByText(messages.alertSuccess.defaultMessage)).toBeInTheDocument();
  });

  it('should display an error when GET CourseDetails fails', async () => {
    axiosMock
      .onGet(getCourseDetailsApiUrl(courseId))
      .reply(404, 'error');
    const { getByText } = render(<ScheduleAndDetails courseId={courseId} />);
    await waitFor(() => {
      expect(getByText(messages.alertLoadFail.defaultMessage)).toBeInTheDocument();
    });
  });

  it('should display an error when GET CourseSettings fails', async () => {
    axiosMock
      .onGet(getCourseSettingsApiUrl(courseId))
      .reply(404, 'error');
    const { getByText } = render(<ScheduleAndDetails courseId={courseId} />);
    await waitFor(() => {
      expect(getByText(messages.alertLoadFail.defaultMessage)).toBeInTheDocument();
    });
  });

  it('should display an error when PUT CourseDetails fails', async () => {
    axiosMock
      .onPut(getCourseDetailsApiUrl(courseId))
      .reply(404, 'error');
    const { getByText } = render(<ScheduleAndDetails courseId={courseId} />);
    await act(async () => {
      await executeThunk(updateCourseDetailsQuery(courseId, 'DaTa'), store.dispatch);
    });
    expect(getByText(messages.alertFail.defaultMessage)).toBeInTheDocument();
  });
});

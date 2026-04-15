import userEvent from '@testing-library/user-event';
import { getConfig } from '@edx/frontend-platform';
import { Helmet } from 'react-helmet';
import Cookies from 'universal-cookie';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { getCourseDetailsUrl } from '@src/data/api';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import stepperMessages from './export-stepper/messages';
import modalErrorMessages from './export-modal-error/messages';
import { getExportStatusApiUrl, postExportCourseApiUrl } from './data/api';
import { EXPORT_STAGES } from './data/constants';
import { exportPageMock } from './__mocks__';
import messages from './messages';
import CourseExportPage from './CourseExportPage';
import { CourseExportProvider } from './CourseExportContext';

let axiosMock;
let cookies;
const courseId = '123';
const courseName = 'About Node JS';

jest.mock('universal-cookie', () => {
  const mCookie = {
    get: jest.fn(),
    set: jest.fn(),
  };
  return jest.fn(() => mCookie);
});

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CourseExportProvider>
        <CourseExportPage />
      </CourseExportProvider>
    </CourseAuthoringProvider>,
  );

describe('<CourseExportPage />', () => {
  beforeEach(() => {
    const user = {
      userId: 1,
      username: 'username',
    };
    const mocks = initializeMocks({ user });
    axiosMock = mocks.axiosMock;
    axiosMock
      .onPost(postExportCourseApiUrl(courseId))
      .reply(200, exportPageMock);
    axiosMock
      .onGet(getCourseDetailsUrl(courseId, user.username))
      .reply(200, { courseId, name: courseName });
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(200, { exportStatus: EXPORT_STAGES.PREPARING });
    cookies = new Cookies();
    cookies.get.mockReturnValue(null);
  });

  it('should render page title correctly', async () => {
    renderComponent();
    await waitFor(() => {
      const helmet = Helmet.peek();
      expect(helmet.title).toEqual(
        `${messages.headingTitle.defaultMessage} | ${courseName} | ${process.env.SITE_NAME}`,
      );
    });
  });

  it('should render without errors', async () => {
    renderComponent();
    expect(await screen.findByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
    const exportPageElement = screen.getByText(messages.headingTitle.defaultMessage, {
      selector: 'h2.sub-header-title',
    });
    expect(exportPageElement).toBeInTheDocument();
    expect(screen.getByText(messages.titleUnderButton.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.description2.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.buttonTitle.defaultMessage)).toBeInTheDocument();
  });

  it('should start exporting on click', async () => {
    const user = userEvent.setup();
    const { container } = renderComponent();
    const button = container.querySelector('.btn-primary')!;
    await user.click(button);
    expect(screen.getByText(stepperMessages.stepperPreparingDescription.defaultMessage)).toBeInTheDocument();
  });

  it('should show modal error', async () => {
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(200, {
        exportStatus: EXPORT_STAGES.EXPORTING,
        exportError: { rawErrorMsg: 'test error', editUnitUrl: 'http://test-url.test' },
      });
    const user = userEvent.setup();
    const { container } = renderComponent();
    const startExportButton = container.querySelector('.btn-primary')!;
    await user.click(startExportButton);
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((r) => setTimeout(r, 3500));
    expect(
      screen.getByText(
        /There has been a failure to export to XML at least one component. It is recommended that you go to the edit page and repair the error before attempting another export. Please check that all components on the page are valid and do not display any error messages. The raw error message is: test error/i,
      ),
    );
    const closeModalWindowButton = screen.getByText('Return to export');
    await user.click(closeModalWindowButton);
    expect(screen.queryByText(modalErrorMessages.errorCancelButtonUnit.defaultMessage)).not.toBeInTheDocument();
    await user.click(closeModalWindowButton);
  });

  it('should fetch status without clicking when cookies has', async () => {
    cookies.get.mockReturnValue({ date: 1679787000 });
    renderComponent();
    expect(screen.getByText(stepperMessages.stepperPreparingDescription.defaultMessage)).toBeInTheDocument();
  });

  it('should show download path for relative path', async () => {
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(200, { exportStatus: EXPORT_STAGES.SUCCESS, exportOutput: '/test-download-path.test' });
    const user = userEvent.setup();
    const { container } = renderComponent();
    const startExportButton = container.querySelector('.btn-primary')!;
    await user.click(startExportButton);
    const downloadButton = screen.getByText(stepperMessages.downloadCourseButtonTitle.defaultMessage);
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton.getAttribute('href')).toEqual(`${getConfig().STUDIO_BASE_URL}/test-download-path.test`);
  });

  it('should show download path for absolute path', async () => {
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(200, { exportStatus: EXPORT_STAGES.SUCCESS, exportOutput: 'http://test-download-path.test' });
    const user = userEvent.setup();
    const { container } = renderComponent();
    const startExportButton = container.querySelector('.btn-primary')!;
    await user.click(startExportButton);
    const downloadButton = screen.getByText(stepperMessages.downloadCourseButtonTitle.defaultMessage);
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton.getAttribute('href')).toEqual('http://test-download-path.test');
  });

  it('displays an alert and sets status to DENIED when API responds with 403', async () => {
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(403);
    const user = userEvent.setup();
    const { container } = renderComponent();
    const startExportButton = container.querySelector('.btn-primary')!;
    await user.click(startExportButton);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not show a connection error alert upon receiving a 404 response from the API', async () => {
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(404);
    const user = userEvent.setup();
    const { container } = renderComponent();
    const startExportButton = container.querySelector('.btn-primary')!;
    await user.click(startExportButton);
    expect(screen.getByText(stepperMessages.stepperPreparingDescription.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

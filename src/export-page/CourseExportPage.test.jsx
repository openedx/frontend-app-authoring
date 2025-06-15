import { getConfig } from '@edx/frontend-platform';
import { Helmet } from 'react-helmet';
import Cookies from 'universal-cookie';

import {
  initializeMocks,
  fireEvent,
  render,
  waitFor,
} from '../testUtils';
import { RequestStatus } from '../data/constants';
import stepperMessages from './export-stepper/messages';
import modalErrorMessages from './export-modal-error/messages';
import { getExportStatusApiUrl, postExportCourseApiUrl } from './data/api';
import { EXPORT_STAGES } from './data/constants';
import { exportPageMock } from './__mocks__';
import messages from './messages';
import CourseExportPage from './CourseExportPage';

let store;
let axiosMock;
let cookies;
const courseId = '123';
const courseName = 'About Node JS';

jest.mock('../generic/model-store', () => ({
  useModel: jest.fn().mockReturnValue({
    name: courseName,
  }),
}));

jest.mock('universal-cookie', () => {
  const mCookie = {
    get: jest.fn(),
    set: jest.fn(),
  };
  return jest.fn(() => mCookie);
});

const renderComponent = () => render(<CourseExportPage courseId={courseId} />);

describe('<CourseExportPage />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(postExportCourseApiUrl(courseId))
      .reply(200, exportPageMock);
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
    const { getByText } = renderComponent();
    await waitFor(() => {
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      const exportPageElement = getByText(messages.headingTitle.defaultMessage, {
        selector: 'h2.sub-header-title',
      });
      expect(exportPageElement).toBeInTheDocument();
      expect(getByText(messages.titleUnderButton.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.description2.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.buttonTitle.defaultMessage)).toBeInTheDocument();
    });
  });
  it('should start exporting on click', async () => {
    const { getByText, container } = renderComponent();
    const button = container.querySelector('.btn-primary');
    fireEvent.click(button);
    expect(getByText(stepperMessages.stepperPreparingDescription.defaultMessage)).toBeInTheDocument();
  });
  it('should show modal error', async () => {
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(200, { exportStatus: EXPORT_STAGES.EXPORTING, exportError: { rawErrorMsg: 'test error', editUnitUrl: 'http://test-url.test' } });
    const { getByText, queryByText, container } = renderComponent();
    const startExportButton = container.querySelector('.btn-primary');
    fireEvent.click(startExportButton);
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((r) => setTimeout(r, 3500));
    expect(getByText(/There has been a failure to export to XML at least one component. It is recommended that you go to the edit page and repair the error before attempting another export. Please check that all components on the page are valid and do not display any error messages. The raw error message is: test error/i));
    const closeModalWindowButton = getByText('Return to export');
    fireEvent.click(closeModalWindowButton);
    expect(queryByText(modalErrorMessages.errorCancelButtonUnit.defaultMessage)).not.toBeInTheDocument();
    fireEvent.click(closeModalWindowButton);
  });
  it('should fetch status without clicking when cookies has', async () => {
    cookies.get.mockReturnValue({ date: 1679787000 });
    const { getByText } = renderComponent();
    expect(getByText(stepperMessages.stepperPreparingDescription.defaultMessage)).toBeInTheDocument();
  });
  it('should show download path for relative path', async () => {
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(200, { exportStatus: EXPORT_STAGES.SUCCESS, exportOutput: '/test-download-path.test' });
    const { getByText, container } = renderComponent();
    const startExportButton = container.querySelector('.btn-primary');
    fireEvent.click(startExportButton);
    await waitFor(() => {
      const downloadButton = getByText(stepperMessages.downloadCourseButtonTitle.defaultMessage);
      expect(downloadButton).toBeInTheDocument();
      expect(downloadButton.getAttribute('href')).toEqual(`${getConfig().STUDIO_BASE_URL}/test-download-path.test`);
    }, { timeout: 4_000 });
  });
  it('should show download path for absolute path', async () => {
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(200, { exportStatus: EXPORT_STAGES.SUCCESS, exportOutput: 'http://test-download-path.test' });
    const { getByText, container } = renderComponent();
    const startExportButton = container.querySelector('.btn-primary');
    fireEvent.click(startExportButton);
    await waitFor(() => {
      const downloadButton = getByText(stepperMessages.downloadCourseButtonTitle.defaultMessage);
      expect(downloadButton).toBeInTheDocument();
      expect(downloadButton.getAttribute('href')).toEqual('http://test-download-path.test');
    }, { timeout: 4_000 });
  });
  it('displays an alert and sets status to DENIED when API responds with 403', async () => {
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(403);
    const { getByRole, container } = renderComponent();
    const startExportButton = container.querySelector('.btn-primary');
    fireEvent.click(startExportButton);
    await waitFor(() => {
      expect(getByRole('alert')).toBeInTheDocument();
    }, { timeout: 4_000 });
    const { loadingStatus } = store.getState().courseExport;
    expect(loadingStatus).toEqual(RequestStatus.DENIED);
  });

  it('sets loading status to FAILED upon receiving a 404 response from the API', async () => {
    axiosMock
      .onGet(getExportStatusApiUrl(courseId))
      .reply(404);
    const { container } = renderComponent();
    const startExportButton = container.querySelector('.btn-primary');
    fireEvent.click(startExportButton);
    await waitFor(() => {
      const { loadingStatus } = store.getState().courseExport;
      expect(loadingStatus).toEqual(RequestStatus.FAILED);
    }, { timeout: 4_000 });
  });
});

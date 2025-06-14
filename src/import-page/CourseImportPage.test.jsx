import { Helmet } from 'react-helmet';
import Cookies from 'universal-cookie';

import { initializeMocks, render, waitFor } from '../testUtils';
import { RequestStatus } from '../data/constants';
import messages from './messages';
import CourseImportPage from './CourseImportPage';
import { getImportStatusApiUrl } from './data/api';
import { IMPORT_STAGES } from './data/constants';
import stepperMessages from './import-stepper/messages';

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
  const Cookie = {
    get: jest.fn(),
    set: jest.fn(),
  };
  return jest.fn(() => Cookie);
});

const renderComponent = () => render(<CourseImportPage courseId={courseId} />);

describe('<CourseImportPage />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getImportStatusApiUrl(courseId, 'testFileName.test'))
      .reply(200, { importStatus: 1, message: '' });
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
      const importPageElement = getByText(messages.headingTitle.defaultMessage, {
        selector: 'h2.sub-header-title',
      });
      expect(importPageElement).toBeInTheDocument();
      expect(getByText(messages.description1.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.description2.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.description3.defaultMessage)).toBeInTheDocument();
    });
  });
  it('should fetch status without clicking when cookies has', async () => {
    cookies.get.mockReturnValue({ date: 1679787000, completed: false, fileName: 'testFileName.test' });
    const { getByText } = renderComponent();
    expect(getByText(stepperMessages.stepperUnpackingDescription.defaultMessage)).toBeInTheDocument();
  });
  it('should show error', async () => {
    axiosMock
      .onGet(getImportStatusApiUrl(courseId, 'testFileName.tar.gz'))
      .reply(200, { importStatus: -IMPORT_STAGES.UPDATING, message: '' });
    cookies.get.mockReturnValue({ date: 1679787000, completed: false, fileName: 'testFileName.tar.gz' });
    const { getByText } = renderComponent();
    await waitFor(() => {
      expect(getByText(stepperMessages.defaultErrorMessage.defaultMessage)).toBeInTheDocument();
    }, { timeout: 4000 });
  });
  it('should show success button', async () => {
    axiosMock
      .onGet(getImportStatusApiUrl(courseId, 'testFileName.tar.gz'))
      .reply(200, { importStatus: IMPORT_STAGES.SUCCESS, message: '' });
    cookies.get.mockReturnValue({ date: 1679787000, completed: false, fileName: 'testFileName.tar.gz' });
    const { getByText } = renderComponent();
    await waitFor(() => {
      expect(getByText(stepperMessages.viewOutlineButton.defaultMessage)).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  it('displays an alert and sets status to DENIED when API responds with 403', async () => {
    axiosMock
      .onGet(getImportStatusApiUrl(courseId, 'testFileName.tar.gz'))
      .reply(403);
    cookies.get.mockReturnValue({ date: 1679787000, completed: false, fileName: 'testFileName.tar.gz' });
    const { getByRole } = renderComponent();
    await waitFor(() => {
      expect(getByRole('alert')).toBeInTheDocument();
    }, { timeout: 4000 });
    const { loadingStatus } = store.getState().courseImport;
    expect(loadingStatus).toEqual(RequestStatus.DENIED);
  });

  it('sets loading status to FAILED upon receiving a 404 response from the API', async () => {
    axiosMock
      .onGet(getImportStatusApiUrl(courseId, 'testFileName.tar.gz'))
      .reply(404);
    cookies.get.mockReturnValue({ date: 1679787000, completed: false, fileName: 'testFileName.tar.gz' });
    renderComponent();
    await waitFor(() => {
      const { loadingStatus } = store.getState().courseImport;
      expect(loadingStatus).toEqual(RequestStatus.FAILED);
    }, { timeout: 4000 });
  });
});

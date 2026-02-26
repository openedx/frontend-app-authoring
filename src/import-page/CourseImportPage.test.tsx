import { screen } from '@testing-library/react';
import { Helmet } from 'react-helmet';
import Cookies from 'universal-cookie';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { getCourseDetailsUrl } from '@src/data/api';
import { initializeMocks, render, waitFor } from '@src/testUtils';
import messages from './messages';
import CourseImportPage from './CourseImportPage';
import { getImportStatusApiUrl } from './data/api';
import { IMPORT_STAGES } from './data/constants';
import stepperMessages from './import-stepper/messages';
import { CourseImportProvider } from './CourseImportContext';

let axiosMock;
let cookies;
const courseId = '123';
const courseName = 'About Node JS';

jest.mock('universal-cookie', () => {
  const Cookie = {
    get: jest.fn(),
    set: jest.fn(),
  };
  return jest.fn(() => Cookie);
});

const renderComponent = () => render(
  <CourseAuthoringProvider courseId={courseId}>
    <CourseImportProvider>
      <CourseImportPage />
    </CourseImportProvider>
  </CourseAuthoringProvider>,
);

describe('<CourseImportPage />', () => {
  beforeEach(() => {
    const user = {
      userId: 1,
      username: 'username',
    };
    const mocks = initializeMocks({ user });
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getImportStatusApiUrl(courseId, 'testFileName.test'))
      .reply(200, { importStatus: 1, message: '' });
    axiosMock
      .onGet(getCourseDetailsUrl(courseId, user.username))
      .reply(200, { courseId, name: courseName });
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
    const importPageElement = screen.getByText(messages.headingTitle.defaultMessage, {
      selector: 'h2.sub-header-title',
    });
    expect(importPageElement).toBeInTheDocument();
    expect(screen.getByText(messages.description1.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.description2.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.description3.defaultMessage)).toBeInTheDocument();
  });

  it('should fetch status without clicking when cookies has', async () => {
    cookies.get.mockReturnValue({ date: 1679787000, fileName: 'testFileName.test' });
    renderComponent();
    expect(screen.getByText(stepperMessages.stepperUnpackingDescription.defaultMessage)).toBeInTheDocument();
  });

  it('should show error', async () => {
    const errorMessage = 'This is a test error message';
    axiosMock
      .onGet(getImportStatusApiUrl(courseId, 'testFileName.tar.gz'))
      .reply(200, { importStatus: -IMPORT_STAGES.UPDATING, message: errorMessage });
    cookies.get.mockReturnValue({ date: 1679787000, fileName: 'testFileName.tar.gz' });
    renderComponent();
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('should show success button', async () => {
    axiosMock
      .onGet(getImportStatusApiUrl(courseId, 'testFileName.tar.gz'))
      .reply(200, { importStatus: IMPORT_STAGES.SUCCESS, message: '' });
    cookies.get.mockReturnValue({ date: 1679787000, fileName: 'testFileName.tar.gz' });
    renderComponent();
    expect(await screen.findByText(stepperMessages.viewOutlineButton.defaultMessage)).toBeInTheDocument();
  });

  it('displays an alert and sets status to DENIED when API responds with 403', async () => {
    axiosMock
      .onGet(getImportStatusApiUrl(courseId, 'testFileName.tar.gz'))
      .reply(403);
    cookies.get.mockReturnValue({ date: 1679787000, fileName: 'testFileName.tar.gz' });
    renderComponent();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('shows an error message upon receiving a 404 response from the API', async () => {
    axiosMock
      .onGet(getImportStatusApiUrl(courseId, 'testFileName.tar.gz'))
      .reply(404);
    cookies.get.mockReturnValue({ date: 1679787000, fileName: 'testFileName.tar.gz' });
    renderComponent();
    expect(await screen.findByText(messages.defaultErrorMessage.defaultMessage)).toBeInTheDocument();
  });
});

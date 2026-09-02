import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { useCourseUserPermissions } from '@src/authz/hooks';

import {
  render,
  waitFor,
  initializeMocks,
  screen,
  userEvent,
} from '@src/testUtils';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { getCertificatesApiUrl, getUpdateCertificateActiveStatusApiUrl } from '../../data/api';
import { certificatesDataMock } from '../../__mocks__';
import messages from '../../messages';
import HeaderButtons from './HeaderButtons';
import { CertificatesProvider } from '@src/certificates/context';

let axiosMock;
const courseId = 'course-123';

jest.mock('@src/authz/hooks', () => ({
  useCourseUserPermissions: jest.fn(),
}));

const mockPermissions = (overrides = {}) =>
  jest.mocked(useCourseUserPermissions).mockReturnValue({
    isLoading: false,
    isAuthzEnabled: true,
    canViewCertificates: true,
    canManageCertificates: true,
    ...overrides,
  } as ReturnType<typeof useCourseUserPermissions>);

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CertificatesProvider>
        <HeaderButtons />
      </CertificatesProvider>
    </CourseAuthoringProvider>,
  );

describe('HeaderButtons Component', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockWaffleFlags({ enableAuthzCourseAuthoring: false });
    mockPermissions();
    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, certificatesDataMock);
  });

  it('updates preview URL param based on selected dropdown item', async () => {
    const user = userEvent.setup();
    renderComponent();

    const previewLink = await waitFor(() =>
      screen.getByRole('link', { name: messages.headingActionsPreview.defaultMessage })
    );

    expect(previewLink).toHaveAttribute('href', expect.stringContaining(certificatesDataMock.courseModes[0]));

    const dropdownButton = screen.getByRole('button', { name: certificatesDataMock.courseModes[0] });
    await user.click(dropdownButton);

    const verifiedMode = screen.getByRole('button', { name: certificatesDataMock.courseModes[1] });
    await user.click(verifiedMode);

    await waitFor(() => {
      expect(previewLink).toHaveAttribute('href', expect.stringContaining(certificatesDataMock.courseModes[1]));
    });
  });

  it('activates certificate when button is clicked', async () => {
    const user = userEvent.setup();

    axiosMock
      .onPost(getUpdateCertificateActiveStatusApiUrl(certificatesDataMock.certificateActivationHandlerUrl))
      .reply(200);

    renderComponent();

    const activationButton = await screen.findByRole('button', {
      name: messages.headingActionsActivate.defaultMessage,
    });

    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, { ...certificatesDataMock, isActive: true });

    await user.click(activationButton);

    expect(screen.getByRole('button', { name: messages.headingActionsDeactivate.defaultMessage })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.headingActionsActivate.defaultMessage })).not
      .toBeInTheDocument();
  });

  it('deactivates certificate when button is clicked', async () => {
    const user = userEvent.setup();

    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, { ...certificatesDataMock, isActive: true });

    axiosMock
      .onPost(getUpdateCertificateActiveStatusApiUrl(certificatesDataMock.certificateActivationHandlerUrl))
      .reply(200);

    renderComponent();

    const deactivateButton = await screen.findByRole('button', {
      name: messages.headingActionsDeactivate.defaultMessage,
    });

    axiosMock
      .onGet(getCertificatesApiUrl(courseId))
      .reply(200, { ...certificatesDataMock, isActive: false });

    await user.click(deactivateButton);

    expect(screen.getByRole('button', { name: messages.headingActionsActivate.defaultMessage })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.headingActionsDeactivate.defaultMessage })).not
      .toBeInTheDocument();
  });

  it('hides activate button in view-only mode', async () => {
    mockPermissions({ canManageCertificates: false });
    renderComponent();

    await waitFor(() => screen.getByRole('link', { name: messages.headingActionsPreview.defaultMessage }));

    expect(screen.queryByRole('button', { name: messages.headingActionsActivate.defaultMessage })).not
      .toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.headingActionsDeactivate.defaultMessage })).not
      .toBeInTheDocument();
  });
});

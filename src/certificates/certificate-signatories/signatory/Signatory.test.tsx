import { initializeMocks, render, screen, userEvent } from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { CertificatesProvider } from '@src/certificates/context';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { useCourseUserPermissions } from '@src/authz/hooks';

import { signatoriesMock } from '../../__mocks__';
import commonMessages from '../../messages';
import messages from '../messages';
import Signatory from './Signatory';

const mockHandleEdit = jest.fn();

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

const renderSignatory = (props) =>
  render(
    <CourseAuthoringProvider courseId="course-123">
      <CertificatesProvider>
        <Signatory {...props} />
      </CertificatesProvider>
    </CourseAuthoringProvider>,
  );

const defaultProps = { ...signatoriesMock[0], handleEdit: mockHandleEdit, index: 0 };

describe('Signatory Component', () => {
  beforeEach(() => {
    initializeMocks();
    mockWaffleFlags({ enableAuthzCourseAuthoring: false });
    mockPermissions();
  });

  it('renders signatory data in view mode', () => {
    renderSignatory(defaultProps);
    const signatureImage = screen.getByAltText(messages.imageLabel.defaultMessage);
    const sectionTitle = screen.getByRole('heading', {
      level: 3,
      name: `${messages.signatoryTitle.defaultMessage} ${defaultProps.index + 1}`,
    });

    expect(sectionTitle).toBeInTheDocument();
    expect(screen.getByText(defaultProps.name, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.title, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.organization, { exact: false })).toBeInTheDocument();
    expect(signatureImage).toBeInTheDocument();
    expect(signatureImage).toHaveAttribute('src', expect.stringContaining(defaultProps.signatureImagePath));
    expect(screen.queryByText(messages.namePlaceholder.defaultMessage)).not.toBeInTheDocument();
  });

  it('calls handleEdit when the edit button is clicked', async () => {
    const user = userEvent.setup();
    renderSignatory(defaultProps);

    const editButton = screen.getByRole('button', { name: commonMessages.editTooltip.defaultMessage });
    await user.click(editButton);

    expect(mockHandleEdit).toHaveBeenCalled();
  });

  it('hides edit button in view-only mode', () => {
    mockPermissions({ canManageCertificates: false });
    renderSignatory(defaultProps);

    expect(screen.queryByRole('button', { name: commonMessages.editTooltip.defaultMessage })).not
      .toBeInTheDocument();
  });
});

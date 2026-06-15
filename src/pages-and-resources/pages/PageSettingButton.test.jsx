// @ts-check
import { screen, render, initializeMocks, fireEvent } from '../../testUtils';
import PageSettingButton from './PageSettingButton';
import { useCourseUserPermissions } from '../../authz/hooks';
import PagesAndResourcesProvider from '../PagesAndResourcesProvider';

jest.mock('../../authz/hooks', () => ({
  ...jest.requireActual('../../authz/hooks'),
  useCourseUserPermissions: jest.fn(),
}));

const defaultProps = {
  id: 'page_id',
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  legacyLink: 'http://legacylink.com/tabs',
  allowedOperations: { configure: true, enable: true },
};

const renderComponent = (props = {}, { isEditable = true, canManageAdvancedSettings = true } = {}) => {
  jest.mocked(useCourseUserPermissions).mockReturnValue({
    isLoading: false,
    isAuthzEnabled: true,
    canManageAdvancedSettings,
  });
  return render(
    <PagesAndResourcesProvider courseId={defaultProps.courseId} isEditable={isEditable}>
      <PageSettingButton {...defaultProps} {...props} />
    </PagesAndResourcesProvider>,
  );
};

describe('PageSettingButton', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the settings button with the new textbooks page link', () => {
    renderComponent({ legacyLink: 'http://legacylink.com/textbooks' });

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', `/course/${defaultProps.courseId}/page-id`);
  });

  it('does not render link when legacyLink prop value incorrect', () => {
    renderComponent({ legacyLink: 'http://legacylink.com/some-value' });

    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders the settings button with the new custom pages link', () => {
    renderComponent();

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', `/course/${defaultProps.courseId}/page-id`);
  });

  it('renders disabled icon button in read-only mode with legacy link', () => {
    renderComponent({ legacyLink: 'http://legacylink.com/textbooks' }, { isEditable: false });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders arrow link when user is editable', () => {
    renderComponent({ legacyLink: 'http://legacylink.com/textbooks' }, { isEditable: true });

    const linkElement = screen.getByRole('link');
    expect(linkElement).toBeInTheDocument();
  });

  it('does not render when no legacyLink and cannot configure', () => {
    renderComponent({ allowedOperations: null, legacyLink: null });

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('navigates to settings page when settings gear button clicked', () => {
    renderComponent({ legacyLink: 'http://legacylink.com/some-value' });

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
  });

  it('renders disabled gear for progress app when user lacks MANAGE_ADVANCED_SETTINGS', () => {
    renderComponent(
      { id: 'progress', legacyLink: null },
      { canManageAdvancedSettings: false },
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders enabled gear for progress app when user has MANAGE_ADVANCED_SETTINGS', () => {
    renderComponent(
      { id: 'progress', legacyLink: null },
      { canManageAdvancedSettings: true },
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('renders disabled gear for wiki app when user lacks MANAGE_ADVANCED_SETTINGS', () => {
    renderComponent(
      { id: 'wiki', legacyLink: null },
      { canManageAdvancedSettings: false },
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders enabled gear for wiki app when user has MANAGE_ADVANCED_SETTINGS', () => {
    renderComponent(
      { id: 'wiki', legacyLink: null },
      { canManageAdvancedSettings: true },
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('renders enabled gear for other apps even when MANAGE_ADVANCED_SETTINGS is false', () => {
    renderComponent(
      { id: 'discussion', legacyLink: null },
      { canManageAdvancedSettings: false },
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });
});

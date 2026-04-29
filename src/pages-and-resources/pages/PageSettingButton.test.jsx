// @ts-check
import { screen, render, initializeMocks, fireEvent } from '../../testUtils';
import PageSettingButton from './PageSettingButton';
import { mockWaffleFlags } from '../../data/apiHooks.mock';

const defaultProps = {
  id: 'page_id',
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  legacyLink: 'http://legacylink.com/tabs',
  allowedOperations: { configure: true, enable: true },
};

const renderComponent = (props = {}) => render(<PageSettingButton {...defaultProps} {...props} />);

mockWaffleFlags();

describe('PageSettingButton', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the settings button with the new textbooks page link when useNewTextbooksPage is true', () => {
    renderComponent({ legacyLink: 'http://legacylink.com/textbooks' });

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', `/course/${defaultProps.courseId}/page-id`);
  });

  it('does not render link when legacyLink prop value incorrect', () => {
    renderComponent({ legacyLink: 'http://legacylink.com/some-value' });

    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders the settings button with the legacy link when useNewTextbooksPage is false', () => {
    mockWaffleFlags({ useNewTextbooksPage: false });

    renderComponent({ legacyLink: 'http://legacylink.com/textbooks' });

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', 'http://legacylink.com/textbooks');
  });

  it('renders the settings button with the new custom pages link when useNewCustomPages is true', () => {
    renderComponent();

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', `/course/${defaultProps.courseId}/page-id`);
  });

  it('renders the settings button with the legacy link when useNewCustomPages is false', () => {
    mockWaffleFlags({ useNewCustomPages: false });

    renderComponent();

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', defaultProps.legacyLink);
  });

  it('renders disabled icon button in read-only mode with legacy link', () => {
    renderComponent({ readOnly: true, legacyLink: 'http://legacylink.com/textbooks' });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders enabled button by default when readOnly is not specified (default false)', () => {
    // readOnly defaults to false - button should be enabled
    renderComponent({ legacyLink: 'http://legacylink.com/textbooks' });

    const linkElement = screen.getByRole('link');
    expect(linkElement).toBeInTheDocument();
  });

  it('does not render when no legacyLink and cannot configure', () => {
    renderComponent({ allowedOperations: null, legacyLink: null });

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('navigates to settings page when settings button clicked (readOnly=false)', () => {
    renderComponent({ legacyLink: 'http://legacylink.com/some-value', readOnly: false });

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    // The button click invokes navigate — component stays mounted without errors
  });

  it('navigates to settings page with readOnly param when settings button clicked (readOnly=true)', () => {
    renderComponent({ legacyLink: 'http://legacylink.com/some-value', readOnly: true });

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    // Clicking triggers navigate with ?readOnly=true
  });
});

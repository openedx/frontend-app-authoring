// @ts-check
import { screen, render, initializeMocks } from '../../testUtils';
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
});

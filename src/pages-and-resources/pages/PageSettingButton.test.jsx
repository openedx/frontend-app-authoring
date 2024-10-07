import { screen, render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import PageSettingButton from './PageSettingButton';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => {
  // eslint-disable-next-line global-require
  const PropTypes = require('prop-types');

  const Link = ({ children, to }) => <a href={to}>{children}</a>;

  Link.propTypes = {
    children: PropTypes.node.isRequired,
    to: PropTypes.string.isRequired,
  };

  return {
    useNavigate: jest.fn(),
    Link,
  };
});

const mockWaffleFlags = {
  useNewTextbooksPage: true,
  useNewCustomPages: true,
};

const defaultProps = {
  id: 'page_id',
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  legacyLink: 'http://legacylink.com/tabs',
  allowedOperations: { configure: true, enable: true },
};

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <PageSettingButton {...defaultProps} {...props} />
  </IntlProvider>,
);

describe('PageSettingButton', () => {
  beforeEach(() => {
    useSelector.mockClear();
  });

  it('renders the settings button with the new textbooks page link when useNewTextbooksPage is true', () => {
    useSelector.mockReturnValue(mockWaffleFlags);

    renderComponent({ legacyLink: 'http://legacylink.com/textbooks' });

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', `/course/${defaultProps.courseId}/page-id`);
  });

  it('does not render link when legacyLink prop value incorrect', () => {
    useSelector.mockReturnValue(mockWaffleFlags);

    renderComponent({ legacyLink: 'http://legacylink.com/some-value' });

    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders the settings button with the legacy link when useNewTextbooksPage is false', () => {
    useSelector.mockReturnValue({ ...mockWaffleFlags, useNewTextbooksPage: false });

    renderComponent({ legacyLink: 'http://legacylink.com/textbooks' });

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', 'http://legacylink.com/textbooks');
  });

  it('renders the settings button with the new custom pages link when useNewCustomPages is true', () => {
    useSelector.mockReturnValue(mockWaffleFlags);

    renderComponent();

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', `/course/${defaultProps.courseId}/page-id`);
  });

  it('renders the settings button with the legacy link when useNewCustomPages is false', () => {
    useSelector.mockReturnValue({ ...mockWaffleFlags, useNewCustomPages: false });

    renderComponent();

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', defaultProps.legacyLink);
  });
});

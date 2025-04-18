import { screen, render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  const navigate = jest.fn();

  beforeEach(() => {
    useSelector.mockClear();
    useNavigate.mockReturnValue(navigate);
  });

  it('navigates to the new textbooks page link when useNewTextbooksPage is true', () => {
    useSelector.mockReturnValue(mockWaffleFlags);

    renderComponent({ legacyLink: 'http://legacylink.com/textbooks' });

    const buttonElement = screen.getByRole('button', { name: /settings/i });
    buttonElement.click();

    expect(navigate).toHaveBeenCalledWith(`/course/${defaultProps.courseId}/page-id`);
  });

  it('does not render button when legacyLink prop value incorrect', () => {
    useSelector.mockReturnValue(mockWaffleFlags);

    renderComponent({ legacyLink: 'http://legacylink.com/some-value' });

    expect(screen.queryByRole('IconButton', { name: /settings/i })).toBeNull();
  });

  it('navigates to the legacy link when useNewTextbooksPage is false', () => {
    useSelector.mockReturnValue({ ...mockWaffleFlags, useNewTextbooksPage: false });

    renderComponent({ legacyLink: 'http://legacylink.com/textbooks' });

    const buttonElement = screen.getByRole('button', { name: /settings/i });
    buttonElement.click();

    expect(navigate).toHaveBeenCalledWith('http://legacylink.com/textbooks');
  });

  it('navigates to the new custom pages link when useNewCustomPages is true', () => {
    useSelector.mockReturnValue(mockWaffleFlags);

    renderComponent();

    const buttonElement = screen.getByRole('button', { name: /settings/i });
    buttonElement.click();

    expect(navigate).toHaveBeenCalledWith(`/course/${defaultProps.courseId}/page-id`);
  });

  it('navigates to the legacy link when useNewCustomPages is false', () => {
    useSelector.mockReturnValue({ ...mockWaffleFlags, useNewCustomPages: false });

    renderComponent();

    const buttonElement = screen.getByRole('button', { name: /settings/i });
    buttonElement.click();

    expect(navigate).toHaveBeenCalledWith(defaultProps.legacyLink);
  });
});

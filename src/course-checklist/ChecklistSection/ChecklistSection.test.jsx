import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ChecklistItemBody from './ChecklistItemBody';
import messages from './messages';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('react-router', () => ({
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();
useNavigate.mockReturnValue(mockNavigate);

const defaultProps = {
  courseId: 'course-v1:edX+DemoX+2024',
  checkId: 'welcomeMessage',
  isCompleted: false,
  updateLink: 'https://example.com/update',
  intl: {
    formatMessage: jest.fn(({ defaultMessage }) => defaultMessage),
  },
};

const waffleFlags = {
  ENABLE_NEW_COURSE_UPDATES_PAGE: false,
};

describe('ChecklistItemBody', () => {
  beforeEach(() => {
    useSelector.mockReturnValue({ waffleFlags });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders uncompleted icon when isCompleted is false', () => {
    render(
      <IntlProvider locale="en">
        <ChecklistItemBody {...defaultProps} />
      </IntlProvider>,
    );

    const uncompletedIcon = screen.getByTestId('uncompleted-icon');
    expect(uncompletedIcon).toBeInTheDocument();
  });

  it('renders completed icon when isCompleted is true', () => {
    render(
      <IntlProvider locale="en">
        <ChecklistItemBody {...defaultProps} isCompleted />
      </IntlProvider>,
    );

    const completedIcon = screen.getByTestId('completed-icon');
    expect(completedIcon).toBeInTheDocument();
  });

  it('renders short and long descriptions based on checkId', () => {
    render(
      <IntlProvider locale="en">
        <ChecklistItemBody {...defaultProps} />
      </IntlProvider>,
    );

    const shortDescription = screen.getByText(messages.welcomeMessageShortDescription.defaultMessage);
    const longDescription = screen.getByText(messages.welcomeMessageLongDescription.defaultMessage);

    expect(shortDescription).toBeInTheDocument();
    expect(longDescription).toBeInTheDocument();
  });

  it('renders update hyperlink when updateLink is provided', () => {
    render(
      <IntlProvider locale="en">
        <ChecklistItemBody {...defaultProps} />
      </IntlProvider>,
    );

    const updateLink = screen.getByTestId('update-hyperlink');
    expect(updateLink).toBeInTheDocument();
  });

  it('navigates to internal course page if ENABLE_NEW_COURSE_UPDATES_PAGE flag is enabled', () => {
    useSelector.mockReturnValue({ waffleFlags: { ENABLE_NEW_COURSE_UPDATES_PAGE: true } });

    render(
      <IntlProvider locale="en">
        <ChecklistItemBody {...defaultProps} />
      </IntlProvider>,
    );

    const updateLink = screen.getByTestId('update-hyperlink');
    fireEvent.click(updateLink);

    expect(mockNavigate).toHaveBeenCalledWith(`/course/${defaultProps.courseId}/course_info`);
  });

  it('redirects to external link if ENABLE_NEW_COURSE_UPDATES_PAGE flag is disabled', () => {
    render(
      <IntlProvider locale="en">
        <ChecklistItemBody {...defaultProps} />
      </IntlProvider>,
    );

    const updateLink = screen.getByTestId('update-hyperlink');
    fireEvent.click(updateLink);

    expect(window.location.href).toBe('http://localhost/');
  });
});

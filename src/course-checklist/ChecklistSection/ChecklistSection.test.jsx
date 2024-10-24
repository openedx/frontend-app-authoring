import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
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
};

const renderComponent = (props = {}, mockWaffleFlags = { useNewUpdatesPage: false }) => {
  useSelector.mockReturnValue(mockWaffleFlags);
  return render(
    <IntlProvider locale="en">
      <ChecklistItemBody {...defaultProps} {...props} />
    </IntlProvider>,
  );
};

describe('ChecklistItemBody', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders uncompleted icon when isCompleted is false', () => {
    renderComponent();
    const uncompletedIcon = screen.getByTestId('uncompleted-icon');
    expect(uncompletedIcon).toBeInTheDocument();
  });

  it('renders completed icon when isCompleted is true', () => {
    renderComponent({ isCompleted: true });
    const completedIcon = screen.getByTestId('completed-icon');
    expect(completedIcon).toBeInTheDocument();
  });

  it('renders short and long descriptions based on checkId', () => {
    renderComponent();
    const shortDescription = screen.getByText(messages.welcomeMessageShortDescription.defaultMessage);
    const longDescription = screen.getByText(messages.welcomeMessageLongDescription.defaultMessage);

    expect(shortDescription).toBeInTheDocument();
    expect(longDescription).toBeInTheDocument();
  });

  it('renders update hyperlink when updateLink is provided', () => {
    renderComponent();
    const updateLink = screen.getByTestId('update-hyperlink');
    expect(updateLink).toBeInTheDocument();
  });

  it('navigates to internal course page if useNewUpdatesPage flag is enabled', () => {
    renderComponent({}, { useNewUpdatesPage: true });
    const updateLink = screen.getByTestId('update-hyperlink');
    fireEvent.click(updateLink);

    expect(mockNavigate).toHaveBeenCalledWith(`/course/${defaultProps.courseId}/course_info`);
  });

  it('redirects to external link if useNewUpdatesPage flag is disabled', () => {
    renderComponent();
    const updateLink = screen.getByTestId('update-hyperlink');
    fireEvent.click(updateLink);

    waitFor(() => {
      expect(window.location.href).toBe(defaultProps.updateLink);
    });
  });
});

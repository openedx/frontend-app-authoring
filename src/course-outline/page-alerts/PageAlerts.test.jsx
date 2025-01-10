import React from 'react';
import { useSelector } from 'react-redux';
import {
  act,
  render,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp, getConfig } from '@edx/frontend-platform';

import PageAlerts from './PageAlerts';
import messages from './messages';
import initializeStore from '../../store';
import { API_ERROR_TYPES } from '../constants';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

let store;
const handleDismissNotification = jest.fn();

const pageAlertsData = {
  courseId: 'course-id',
  notificationDismissUrl: '',
  handleDismissNotification: null,
  discussionsSettings: {},
  discussionsIncontextFeedbackUrl: '',
  discussionsIncontextLearnmoreUrl: '',
  deprecatedBlocksInfo: {},
  proctoringErrors: [],
  mfeProctoredExamSettingsUrl: '',
  advanceSettingsUrl: '',
  savingStatus: '',
};

const renderComponent = (props) => render(
  <AppProvider store={store} messages={{}}>
    <IntlProvider locale="en">
      <PageAlerts
        {...pageAlertsData}
        {...props}
      />
    </IntlProvider>
  </AppProvider>,
);

describe('<PageAlerts />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
    useSelector.mockReturnValue({});
  });

  it('renders null when no alerts are present', () => {
    renderComponent();
    expect(screen.queryByTestId('browser-router')).toBeEmptyDOMElement();
  });

  it('renders configuration alerts', async () => {
    renderComponent({
      ...pageAlertsData,
      notificationDismissUrl: 'some-url',
      handleDismissNotification,
    });

    expect(screen.queryByText(messages.configurationErrorTitle.defaultMessage)).toBeInTheDocument();
    const dismissBtn = screen.queryByText('Dismiss');
    await act(async () => fireEvent.click(dismissBtn));

    expect(handleDismissNotification).toBeCalled();
  });

  it('renders discussion alerts', async () => {
    renderComponent({
      ...pageAlertsData,
      discussionsSettings: {
        providerType: 'openedx',
      },
      discussionsIncontextFeedbackUrl: 'some-feedback-url',
      discussionsIncontextLearnmoreUrl: 'some-learn-more-url',
    });

    expect(screen.queryByText(messages.discussionNotificationText.defaultMessage)).toBeInTheDocument();
    const learnMoreBtn = screen.queryByText(messages.discussionNotificationLearnMore.defaultMessage);
    expect(learnMoreBtn).toBeInTheDocument();
    expect(learnMoreBtn).toHaveAttribute('href', 'some-learn-more-url');

    const dismissBtn = screen.queryByText('Dismiss');
    fireEvent.click(dismissBtn);
    const discussionAlertDismissKey = `discussionAlertDismissed-${pageAlertsData.courseId}`;
    expect(localStorage.getItem(discussionAlertDismissKey)).toBe('true');

    await waitFor(() => {
      const feedbackLink = screen.queryByText(messages.discussionNotificationFeedback.defaultMessage);
      expect(feedbackLink).toBeInTheDocument();
      expect(feedbackLink).toHaveAttribute('href', 'some-feedback-url');
    });
  });

  it('renders deprecation warning alerts', async () => {
    renderComponent({
      ...pageAlertsData,
      deprecatedBlocksInfo: {
        blocks: [['url1', 'block1'], ['url2']],
        deprecatedEnabledBlockTypes: ['lti', 'video'],
        advanceSettingsUrl: '/some-url',
      },
    });

    expect(screen.queryByText(messages.deprecationWarningTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText(messages.deprecationWarningBlocksText.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText('block1')).toHaveAttribute('href', 'url1');
    expect(screen.queryByText(messages.deprecatedComponentName.defaultMessage)).toHaveAttribute('href', 'url2');

    const feedbackLink = screen.queryByText(messages.advancedSettingLinkText.defaultMessage);
    expect(feedbackLink).toBeInTheDocument();
    expect(feedbackLink).toHaveAttribute('href', `${getConfig().STUDIO_BASE_URL}/some-url`);
    expect(screen.queryByText('lti')).toBeInTheDocument();
    expect(screen.queryByText('video')).toBeInTheDocument();
  });

  it('renders proctoring alerts with mfe settings link', async () => {
    renderComponent({
      ...pageAlertsData,
      mfeProctoredExamSettingsUrl: 'mfe-url',
      proctoringErrors: [
        { key: '1', model: { displayName: 'error 1' }, message: 'message 1' },
        { key: '2', model: { displayName: 'error 2' }, message: 'message 2' },
      ],
    });

    expect(screen.queryByText('error 1')).toBeInTheDocument();
    expect(screen.queryByText('error 2')).toBeInTheDocument();
    expect(screen.queryByText('message 1')).toBeInTheDocument();
    expect(screen.queryByText('message 2')).toBeInTheDocument();
    expect(screen.queryByText(messages.proctoredSettingsLinkText.defaultMessage)).toHaveAttribute('href', 'mfe-url');
  });

  it('renders proctoring alerts without mfe settings link', async () => {
    renderComponent({
      ...pageAlertsData,
      advanceSettingsUrl: '/some-url',
      proctoringErrors: [
        { key: '1', model: { displayName: 'error 1' }, message: 'message 1' },
        { key: '2', model: { displayName: 'error 2' }, message: 'message 2' },
      ],
    });

    expect(screen.queryByText('error 1')).toBeInTheDocument();
    expect(screen.queryByText('error 2')).toBeInTheDocument();
    expect(screen.queryByText('message 1')).toBeInTheDocument();
    expect(screen.queryByText('message 2')).toBeInTheDocument();
    expect(screen.queryByText(messages.advancedSettingLinkText.defaultMessage)).toHaveAttribute(
      'href',
      `${getConfig().STUDIO_BASE_URL}/some-url`,
    );
  });

  it('renders new & error files alert', async () => {
    useSelector.mockReturnValue({
      newFiles: ['periodic-table.css'],
      conflictingFiles: [],
      errorFiles: ['error.css'],
    });
    renderComponent();
    expect(screen.queryByText(messages.newFileAlertTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText(messages.errorFileAlertTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText(messages.newFileAlertAction.defaultMessage)).toHaveAttribute(
      'href',
      `${getConfig().STUDIO_BASE_URL}/assets/course-id`,
    );
  });

  it('renders conflicting files alert', async () => {
    useSelector.mockReturnValue({
      newFiles: [],
      conflictingFiles: ['some.css', 'some.js'],
      errorFiles: [],
    });
    renderComponent();
    expect(screen.queryByText(messages.conflictingFileAlertTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText(messages.newFileAlertAction.defaultMessage)).toHaveAttribute(
      'href',
      `${getConfig().STUDIO_BASE_URL}/assets/course-id`,
    );
  });

  it('renders api error alerts', async () => {
    renderComponent({
      ...pageAlertsData,
      errors: {
        outlineIndexApi: { data: 'some error', status: 400, type: API_ERROR_TYPES.serverError },
        courseLaunchApi: { type: API_ERROR_TYPES.networkError },
        reindexApi: { type: API_ERROR_TYPES.unknown, data: 'some unknown error' },
      },
    });
    expect(screen.queryByText(messages.networkErrorAlert.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText(messages.serverErrorAlert.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText('some error')).toBeInTheDocument();
    expect(screen.queryByText('some unknown error')).toBeInTheDocument();
  });

  it('renders forbidden api error alerts', async () => {
    renderComponent({
      ...pageAlertsData,
      errors: {
        outlineIndexApi: {
          data: 'some error', status: 403, type: API_ERROR_TYPES.forbidden, dismissable: false,
        },
      },
    });
    expect(screen.queryByText(messages.forbiddenAlert.defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText(messages.forbiddenAlertBody.defaultMessage)).toBeInTheDocument();
  });

  it('renders api error alerts when status is not 403', async () => {
    renderComponent({
      ...pageAlertsData,
      errors: {
        outlineIndexApi: {
          data: 'some error', status: 500, type: API_ERROR_TYPES.serverError, dismissable: true,
        },
      },
    });
    expect(screen.queryByText('some error')).toBeInTheDocument();
  });
});

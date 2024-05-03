import React from 'react';
import { useSelector } from 'react-redux';
import { act, render, fireEvent } from '@testing-library/react';
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
    const { queryByTestId } = renderComponent();
    expect(queryByTestId('browser-router')).toBeEmptyDOMElement();
  });

  it('renders configuration alerts', async () => {
    const { queryByText } = renderComponent({
      ...pageAlertsData,
      notificationDismissUrl: 'some-url',
      handleDismissNotification,
    });

    expect(queryByText(messages.configurationErrorTitle.defaultMessage)).toBeInTheDocument();
    const dismissBtn = queryByText('Dismiss');
    await act(async () => fireEvent.click(dismissBtn));

    expect(handleDismissNotification).toBeCalled();
  });

  it('renders discussion alerts', async () => {
    const { queryByText } = renderComponent({
      ...pageAlertsData,
      discussionsSettings: {
        providerType: 'openedx',
      },
      discussionsIncontextFeedbackUrl: 'some-feedback-url',
      discussionsIncontextLearnmoreUrl: 'some-learn-more-url',
    });

    expect(queryByText(messages.discussionNotificationText.defaultMessage)).toBeInTheDocument();
    const learnMoreBtn = queryByText(messages.discussionNotificationLearnMore.defaultMessage);
    expect(learnMoreBtn).toBeInTheDocument();
    expect(learnMoreBtn).toHaveAttribute('href', 'some-learn-more-url');

    const feedbackLink = queryByText(messages.discussionNotificationFeedback.defaultMessage);
    expect(feedbackLink).toBeInTheDocument();
    expect(feedbackLink).toHaveAttribute('href', 'some-feedback-url');
  });

  it('renders deprecation warning alerts', async () => {
    const { queryByText } = renderComponent({
      ...pageAlertsData,
      deprecatedBlocksInfo: {
        blocks: [['url1', 'block1'], ['url2']],
        deprecatedEnabledBlockTypes: ['lti', 'video'],
        advanceSettingsUrl: '/some-url',
      },
    });

    expect(queryByText(messages.deprecationWarningTitle.defaultMessage)).toBeInTheDocument();
    expect(queryByText(messages.deprecationWarningBlocksText.defaultMessage)).toBeInTheDocument();
    expect(queryByText('block1')).toHaveAttribute('href', 'url1');
    expect(queryByText(messages.deprecatedComponentName.defaultMessage)).toHaveAttribute('href', 'url2');

    const feedbackLink = queryByText(messages.advancedSettingLinkText.defaultMessage);
    expect(feedbackLink).toBeInTheDocument();
    expect(feedbackLink).toHaveAttribute('href', `${getConfig().STUDIO_BASE_URL}/some-url`);
    expect(queryByText('lti')).toBeInTheDocument();
    expect(queryByText('video')).toBeInTheDocument();
  });

  it('renders proctoring alerts with mfe settings link', async () => {
    const { queryByText } = renderComponent({
      ...pageAlertsData,
      mfeProctoredExamSettingsUrl: 'mfe-url',
      proctoringErrors: [
        { key: '1', model: { displayName: 'error 1' }, message: 'message 1' },
        { key: '2', model: { displayName: 'error 2' }, message: 'message 2' },
      ],
    });

    expect(queryByText('error 1')).toBeInTheDocument();
    expect(queryByText('error 2')).toBeInTheDocument();
    expect(queryByText('message 1')).toBeInTheDocument();
    expect(queryByText('message 2')).toBeInTheDocument();
    expect(queryByText(messages.proctoredSettingsLinkText.defaultMessage)).toHaveAttribute('href', 'mfe-url');
  });

  it('renders proctoring alerts without mfe settings link', async () => {
    const { queryByText } = renderComponent({
      ...pageAlertsData,
      advanceSettingsUrl: '/some-url',
      proctoringErrors: [
        { key: '1', model: { displayName: 'error 1' }, message: 'message 1' },
        { key: '2', model: { displayName: 'error 2' }, message: 'message 2' },
      ],
    });

    expect(queryByText('error 1')).toBeInTheDocument();
    expect(queryByText('error 2')).toBeInTheDocument();
    expect(queryByText('message 1')).toBeInTheDocument();
    expect(queryByText('message 2')).toBeInTheDocument();
    expect(queryByText(messages.advancedSettingLinkText.defaultMessage)).toHaveAttribute(
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
    const { queryByText } = renderComponent();
    expect(queryByText(messages.newFileAlertTitle.defaultMessage)).toBeInTheDocument();
    expect(queryByText(messages.errorFileAlertTitle.defaultMessage)).toBeInTheDocument();
    expect(queryByText(messages.newFileAlertAction.defaultMessage)).toHaveAttribute(
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
    const { queryByText } = renderComponent();
    expect(queryByText(messages.conflictingFileAlertTitle.defaultMessage)).toBeInTheDocument();
    expect(queryByText(messages.newFileAlertAction.defaultMessage)).toHaveAttribute(
      'href',
      `${getConfig().STUDIO_BASE_URL}/assets/course-id`,
    );
  });

  it('renders api error alerts', async () => {
    const { queryByText } = renderComponent({
      ...pageAlertsData,
      errors: {
        outlineIndexApi: { data: 'some error', status: 400, type: API_ERROR_TYPES.serverError },
        courseLaunchApi: { type: API_ERROR_TYPES.networkError },
        reindexApi: { type: API_ERROR_TYPES.unknown, data: 'some unknown error' },
      },
    });
    expect(queryByText(messages.networkErrorAlert.defaultMessage)).toBeInTheDocument();
    expect(queryByText(messages.serverErrorAlert.defaultMessage)).toBeInTheDocument();
    expect(queryByText('some error')).toBeInTheDocument();
    expect(queryByText('some unknown error')).toBeInTheDocument();
  });
});

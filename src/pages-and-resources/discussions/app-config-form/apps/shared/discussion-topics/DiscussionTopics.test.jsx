import React from 'react';

import {
  act, fireEvent, queryAllByTestId, queryByTestId, queryByText, render, waitFor, queryByLabelText,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { Formik } from 'formik';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../../../../../store';
import { executeThunk } from '../../../../../../utils';
import { getDiscussionsProvidersUrl } from '../../../../data/api';
import { fetchProviders } from '../../../../data/thunks';
import { legacyApiResponse } from '../../../../factories/mockApiResponses';
import OpenedXConfigFormProvider from '../../openedx/OpenedXConfigFormProvider';
import messages from '../../../messages';
import DiscussionTopics from './DiscussionTopics';

const appConfig = {
  id: 'legacy',
  divideByCohorts: false,
  divideCourseTopicsByCohorts: false,
  discussionTopics: [
    { name: 'General', id: 'course' },
    { name: 'Edx', id: '13f106c6-6735-4e84-b097-0456cff55960' },
  ],
  divideDiscussionIds: [],
  allowAnonymousPosts: false,
  allowAnonymousPostsPeers: false,
  reportedContentEmailNotifications: false,
  allowDivisionByUnit: false,
  restrictedDates: [],
};

const contextValue = {
  discussionTopicErrors: [false, false],
  validDiscussionTopics: [
    { name: 'General', id: 'course' },
    { name: 'Edx', id: '13f106c6-6735-4e84-b097-0456cff55960' },
  ],
  setValidDiscussionTopics: jest.fn(),
};

const courseId = 'course-v1:edX+TestX+Test_Course';

describe('DiscussionTopics', () => {
  let axiosMock;
  let store;
  let container;
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  const createComponent = (data) => {
    const wrapper = render(
      <AppProvider store={store}>
        <IntlProvider locale="en">
          <OpenedXConfigFormProvider value={contextValue}>
            <Formik initialValues={data}>
              <DiscussionTopics />
            </Formik>
          </OpenedXConfigFormProvider>
        </IntlProvider>
      </AppProvider>,
    );
    container = wrapper.container;
  };

  const mockStore = async (mockResponse) => {
    axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, mockResponse);
    await executeThunk(fetchProviders(courseId), store.dispatch);
  };

  test('renders each discussion topic correctly', async () => {
    await mockStore(legacyApiResponse);
    createComponent(appConfig);
    await waitFor(() => {
      expect(queryAllByTestId(container, 'course')).toHaveLength(1);
      expect(queryAllByTestId(container, '13f106c6-6735-4e84-b097-0456cff55960')).toHaveLength(1);
    });
  });

  test('renders discussion topic heading, label and helping text', async () => {
    await mockStore(legacyApiResponse);
    createComponent(appConfig);
    await waitFor(() => {
      expect(queryByText(container, messages.discussionTopics.defaultMessage)).toBeInTheDocument();
      expect(queryByText(container, messages.discussionTopicsLabel.defaultMessage)).toBeInTheDocument();
      expect(queryByText(container, messages.discussionTopicsHelp.defaultMessage)).toBeInTheDocument();
    });
  });

  test('add topic button is rendered correctly', async () => {
    await mockStore(legacyApiResponse);
    createComponent(appConfig);
    await waitFor(() => {
      expect(queryByText(container, messages.addTopicButton.defaultMessage, { selector: 'button' }))
        .toBeInTheDocument();
    });
  });

  test('calls "onClick" callback when add topic button is clicked', async () => {
    await mockStore(legacyApiResponse);
    createComponent(appConfig);

    const addTopicButton = queryByText(container, messages.addTopicButton.defaultMessage, { selector: 'button' });
    await waitFor(async () => {
      expect(queryByText(container, messages.configureAdditionalTopic.defaultMessage)).not.toBeInTheDocument();
      await act(async () => fireEvent.click(addTopicButton));
      expect(queryByText(container, messages.configureAdditionalTopic.defaultMessage)).toBeInTheDocument();
    });
  });

  test('updates discussion topic name', async () => {
    await mockStore(legacyApiResponse);
    createComponent(appConfig);
    const topicCard = queryByTestId(container, '13f106c6-6735-4e84-b097-0456cff55960');

    await act(async () => userEvent.click(queryByLabelText(topicCard, 'Expand')));
    await act(async () => {
      fireEvent.change(topicCard.querySelector('input'), { target: { value: 'new name' } });
    });
    await act(async () => userEvent.click(queryByLabelText(topicCard, 'Collapse')));

    expect(queryByText(topicCard, 'new name')).toBeInTheDocument();
  });
});

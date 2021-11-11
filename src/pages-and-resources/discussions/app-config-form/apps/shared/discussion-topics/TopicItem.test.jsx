import React from 'react';

import {
  queryAllByTestId,
  queryAllByText,
  queryByRole,
  queryByTestId,
  queryByText,
  queryByLabelText,
  render,
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
import messages from '../../../messages';
import TopicItem from './TopicItem';

const appConfig = {
  discussionTopics: [
    { name: 'General', id: 'course' },
    { name: 'Edx', id: '13f106c6-6735-4e84-b097-0456cff55960' },
  ],
  divideDiscussionIds: [],
};

const generalTopic = {
  index: 0,
  name: 'General',
  onDelete: jest.fn(),
  id: 'course',
  hasError: false,
  onFocus: jest.fn(),
};

const additionalTopic = {
  index: 1,
  name: 'Edx',
  onDelete: jest.fn(),
  id: '13f106c6-6735-4e84-b097-0456cff55960',
  hasError: false,
  onFocus: jest.fn(),
};

const courseId = 'course-v1:edX+TestX+Test_Course';

describe('TopicItem', () => {
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

  const createComponent = (props) => {
    const wrapper = render(
      <AppProvider store={store}>
        <IntlProvider locale="en">
          <Formik initialValues={appConfig}>
            <TopicItem {...props} />
          </Formik>
        </IntlProvider>
      </AppProvider>,
    );
    container = wrapper.container;
  };

  const mockStore = async (mockResponse) => {
    axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, mockResponse);
    await executeThunk(fetchProviders(courseId), store.dispatch);
  };

  test('displays a collapsible card for discussion topic', async () => {
    await mockStore(legacyApiResponse);
    createComponent(generalTopic);

    expect(queryAllByTestId(container, 'course')).toHaveLength(1);
  });

  test('displays collapse view of general discussion topic', async () => {
    await mockStore(legacyApiResponse);
    createComponent(generalTopic);

    const generalTopicNode = queryByTestId(container, 'course');
    expect(queryByLabelText(generalTopicNode, 'Expand')).toBeInTheDocument();
    expect(queryByLabelText(generalTopicNode, 'Collapse')).not.toBeInTheDocument();
    expect(queryByText(generalTopicNode, 'General')).toBeInTheDocument();
  });

  test('displays expand view of general discussion topic', async () => {
    await mockStore(legacyApiResponse);
    createComponent(generalTopic);

    const generalTopicNode = queryByTestId(container, 'course');
    userEvent.click(queryByLabelText(generalTopicNode, 'Expand'));

    expect(queryByLabelText(generalTopicNode, 'Expand')).not.toBeInTheDocument();
    expect(queryByLabelText(generalTopicNode, 'Collapse')).toBeInTheDocument();
    expect(queryByRole(generalTopicNode, 'button', { name: 'Delete Topic' })).not.toBeInTheDocument();
    expect(generalTopicNode.querySelector('input')).toBeInTheDocument();
  });

  test('displays expand view of additional discussion topic', async () => {
    await mockStore(legacyApiResponse);
    createComponent(additionalTopic);

    const topicCard = queryByTestId(container, '13f106c6-6735-4e84-b097-0456cff55960');
    userEvent.click(queryByLabelText(topicCard, 'Expand'));

    expect(queryByLabelText(topicCard, 'Expand')).not.toBeInTheDocument();
    expect(queryByLabelText(topicCard, 'Collapse')).toBeInTheDocument();
    expect(queryByRole(topicCard, 'button', { name: 'Delete Topic' })).toBeInTheDocument();
    expect(topicCard.querySelector('input')).toBeInTheDocument();
  });

  test('renders delete topic popup with providerName, label, helping text, a delete and a cancel button', async () => {
    await mockStore(legacyApiResponse);
    createComponent(additionalTopic);

    const topicCard = queryByTestId(container, '13f106c6-6735-4e84-b097-0456cff55960');
    userEvent.click(queryByLabelText(topicCard, 'Expand'));
    userEvent.click(queryByRole(topicCard, 'button', { name: 'Delete Topic' }));

    expect(queryAllByText(container, messages.discussionTopicDeletionLabel.defaultMessage)).toHaveLength(1);
    expect(queryByText(container, messages.discussionTopicDeletionLabel.defaultMessage)).toBeInTheDocument();
    expect(queryByText(container, messages.discussionTopicDeletionHelp.defaultMessage)).toBeInTheDocument();
    expect(queryByText(container, messages.discussionTopicDeletionHelp.defaultMessage)).toBeInTheDocument();
    expect(queryByText(container, messages.deleteButton.defaultMessage)).toBeInTheDocument();
    expect(queryByText(container, messages.cancelButton.defaultMessage)).toBeInTheDocument();
  });

  test('shows help text on field focus', async () => {
    await mockStore(legacyApiResponse);
    createComponent(additionalTopic);

    const topicCard = queryByTestId(container, '13f106c6-6735-4e84-b097-0456cff55960');
    userEvent.click(queryByLabelText(topicCard, 'Expand'));
    topicCard.querySelector('input').focus();

    expect(queryByText(topicCard, messages.addTopicHelpText.defaultMessage)).toBeInTheDocument();
  });
});

import React from 'react';

import {
  queryByLabelText,
  queryByTestId, render, screen, waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, PageRoute } from '@edx/frontend-platform/react';
import { Switch } from 'react-router';

import { history, initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import DiscussionsSettings from './DiscussionsSettings';
import PagesAndResourcesProvider from '../PagesAndResourcesProvider';
import initializeStore from '../../store';
import { getAppsUrl } from './data/api';
import { piazzaApiResponse } from './factories/mockApiResponses';

const courseId = 'course-v1:edX+TestX+Test_Course';

let axiosMock;
let store;
let container;

describe('DiscussionsSettings', () => {
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    axiosMock.onGet(getAppsUrl(courseId)).reply(200, piazzaApiResponse);

    // Leave the DiscussionsSettings route after the test.
    history.push(`/course/${courseId}/pages-and-resources`);

    const wrapper = render(
      <AppProvider store={store}>
        <PagesAndResourcesProvider courseId={courseId}>
          <Switch>
            <PageRoute
              path={[
                `/course/${courseId}/pages-and-resources/discussions/configure/:appId`,
                `/course/${courseId}/pages-and-resources/discussions`,
              ]}
            >
              <DiscussionsSettings courseId={courseId} />
            </PageRoute>
          </Switch>
        </PagesAndResourcesProvider>
      </AppProvider>,
    );
    container = wrapper.container;
  });

  afterEach(() => {

  });

  test('sets selection step from routes', async () => {
    history.push(`/course/${courseId}/pages-and-resources/discussions`);

    // This is an important line that ensures the spinner has been removed - and thus our main
    // content has been loaded - prior to proceeding with our expectations.
    await waitForElementToBeRemoved(screen.getByRole('status'));

    expect(queryByTestId(container, 'appList')).toBeInTheDocument();
    expect(queryByTestId(container, 'appConfigForm')).not.toBeInTheDocument();
  });

  test('sets settings step from routes', async () => {
    history.push(`/course/${courseId}/pages-and-resources/discussions/configure/piazza`);

    // This is an important line that ensures the spinner has been removed - and thus our main
    // content has been loaded - prior to proceeding with our expectations.
    await waitForElementToBeRemoved(screen.getByRole('status'));

    expect(queryByTestId(container, 'appList')).not.toBeInTheDocument();
    expect(queryByTestId(container, 'appConfigForm')).toBeInTheDocument();
  });

  test('successfully advances to settings step', async () => {
    history.push(`/course/${courseId}/pages-and-resources/discussions`);

    // This is an important line that ensures the spinner has been removed - and thus our main
    // content has been loaded - prior to proceeding with our expectations.
    await waitForElementToBeRemoved(screen.getByRole('status'));

    userEvent.click(queryByLabelText(container, 'Select Piazza'));
    userEvent.click(queryByLabelText(container, 'Next'));

    expect(queryByTestId(container, 'appList')).not.toBeInTheDocument();
    expect(queryByTestId(container, 'appConfigForm')).toBeInTheDocument();
  });

  test('successfully goes back to first step', async () => {
    history.push(`/course/${courseId}/pages-and-resources/discussions/configure/piazza`);

    // This is an important line that ensures the spinner has been removed - and thus our main
    // content has been loaded - prior to proceeding with our expectations.
    await waitForElementToBeRemoved(screen.getByRole('status'));

    expect(queryByTestId(container, 'appConfigForm')).toBeInTheDocument();

    userEvent.click(queryByLabelText(container, 'Back'));

    expect(queryByTestId(container, 'appList')).toBeInTheDocument();
    expect(queryByTestId(container, 'appConfigForm')).not.toBeInTheDocument();
  });

  test('successfully closes the modal', async () => {
    history.push(`/course/${courseId}/pages-and-resources/discussions`);

    // This is an important line that ensures the spinner has been removed - and thus our main
    // content has been loaded - prior to proceeding with our expectations.
    await waitForElementToBeRemoved(screen.getByRole('status'));

    expect(queryByTestId(container, 'appList')).toBeInTheDocument();

    userEvent.click(queryByLabelText(container, 'Close'));

    expect(queryByTestId(container, 'appList')).not.toBeInTheDocument();
    expect(queryByTestId(container, 'appConfigForm')).not.toBeInTheDocument();

    expect(window.location.pathname).toEqual(`/course/${courseId}/pages-and-resources`);
  });
});

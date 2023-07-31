import ReactDOM from 'react-dom';
import {
  getConfig, history, initializeMockApp, setConfig,
} from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider, PageRoute } from '@edx/frontend-platform/react';
import {
  act, findByRole, getByRole, queryByLabelText, queryByRole, queryByTestId, queryByText, render,
  screen, waitFor, waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Switch } from 'react-router';
import { fetchCourseDetail } from '../../data/thunks';
import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import PagesAndResourcesProvider from '../PagesAndResourcesProvider';
import ltiMessages from './app-config-form/apps/lti/messages';
import appMessages from './app-config-form/messages';
import messages from './app-list/messages';
import { getDiscussionsProvidersUrl, getDiscussionsSettingsUrl } from './data/api';
import DiscussionsSettings from './DiscussionsSettings';
import {
  courseDetailResponse,
  generatePiazzaApiResponse,
  generateProvidersApiResponse,
  legacyApiResponse,
  piazzaApiResponse,
} from './factories/mockApiResponses';

const courseId = 'course-v1:edX+TestX+Test_Course';
let axiosMock;
let store;
let container;

// Modal creates a portal. Overriding ReactDOM.createPortal allows portals to be tested in jest.
ReactDOM.createPortal = jest.fn(node => node);

function renderComponent() {
  const wrapper = render(
    <AppProvider store={store}>
      <PagesAndResourcesProvider courseId={courseId}>
        <Switch>
          <PageRoute
            path={[
              `/course/${courseId}/pages-and-resources/discussion/configure/:appId`,
              `/course/${courseId}/pages-and-resources/discussion`,
            ]}
          >
            <DiscussionsSettings courseId={courseId} />
          </PageRoute>
        </Switch>
      </PagesAndResourcesProvider>
    </AppProvider>,
  );
  container = wrapper.container;
}

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

    store = initializeStore({
      models: {
        courseDetails: {
          [courseId]: {
            start: Date(),
          },
        },
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    // Leave the DiscussionsSettings route after the test.
    history.push(`/course/${courseId}/pages-and-resources`);
  });

  describe('with successful network connections', () => {
    beforeEach(() => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId))
        .reply(200, generateProvidersApiResponse(false));
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId))
        .reply(200, generatePiazzaApiResponse(true));
      renderComponent();
    });

    test('sets selection step from routes', async () => {
      history.push(`/course/${courseId}/pages-and-resources/discussion`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      expect(queryByTestId(container, 'appList')).toBeInTheDocument();
      expect(queryByTestId(container, 'appConfigForm')).not.toBeInTheDocument();
    });

    test('sets settings step from routes', async () => {
      history.push(`/course/${courseId}/pages-and-resources/discussion/configure/piazza`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      expect(queryByTestId(container, 'appList')).not.toBeInTheDocument();
      expect(queryByTestId(container, 'appConfigForm')).toBeInTheDocument();
    });

    test('successfully advances to settings step for lti', async () => {
      history.push(`/course/${courseId}/pages-and-resources/discussion`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      userEvent.click(queryByLabelText(container, 'Select Piazza'));
      userEvent.click(queryByText(container, messages.nextButton.defaultMessage));

      await waitForElementToBeRemoved(screen.getByRole('status'));

      expect(queryByTestId(container, 'appList')).not.toBeInTheDocument();
      expect(queryByTestId(container, 'appConfigForm')).toBeInTheDocument();
      expect(queryByTestId(container, 'ltiConfigForm')).toBeInTheDocument();
      expect(queryByTestId(container, 'legacyConfigForm')).not.toBeInTheDocument();
    });

    test('successfully advances to settings step for legacy', async () => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse(false, 'legacy'));
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, legacyApiResponse);
      renderComponent();
      history.push(`/course/${courseId}/pages-and-resources/discussion`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      userEvent.click(queryByLabelText(container, 'Select edX'));
      userEvent.click(queryByText(container, messages.nextButton.defaultMessage));

      await waitForElementToBeRemoved(screen.getByRole('status'));

      expect(queryByTestId(container, 'appList')).not.toBeInTheDocument();
      expect(queryByTestId(container, 'appConfigForm')).toBeInTheDocument();
      expect(queryByTestId(container, 'ltiConfigForm')).not.toBeInTheDocument();
      expect(queryByTestId(container, 'legacyConfigForm')).toBeInTheDocument();
    });

    test('successfully goes back to first step', async () => {
      history.push(`/course/${courseId}/pages-and-resources/discussion/configure/piazza`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      expect(queryByTestId(container, 'appConfigForm')).toBeInTheDocument();

      await act(() => userEvent.click(queryByText(container, appMessages.backButton.defaultMessage)));

      await waitFor(() => {
        expect(queryByTestId(container, 'appList')).toBeInTheDocument();
        expect(queryByTestId(container, 'appConfigForm')).not.toBeInTheDocument();
      });
    });

    test('successfully closes the modal', async () => {
      history.push(`/course/${courseId}/pages-and-resources/discussion`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      expect(queryByTestId(container, 'appList')).toBeInTheDocument();

      userEvent.click(queryByLabelText(container, 'Close'));

      expect(queryByTestId(container, 'appList')).not.toBeInTheDocument();
      expect(queryByTestId(container, 'appConfigForm')).not.toBeInTheDocument();

      expect(window.location.pathname).toEqual(`/course/${courseId}/pages-and-resources`);
    });

    test('successfully submit the modal', async () => {
      history.push(`/course/${courseId}/pages-and-resources/discussion`);

      axiosMock.onPost(getDiscussionsSettingsUrl(courseId)).reply(200, generatePiazzaApiResponse(true));

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      userEvent.click(queryByLabelText(container, 'Select Piazza'));

      userEvent.click(getByRole(container, 'button', { name: 'Next' }));

      userEvent.click(await findByRole(container, 'button', { name: 'Save' }));

      // This is an important line that ensures the Close button has been removed, which implies that
      // the full screen modal has been closed following our click of Apply.  Once this has happened,
      // then it's safe to proceed with our expectations.
      await waitForElementToBeRemoved(queryByRole(container, 'button', { name: 'Close' }));

      await waitFor(() => expect(window.location.pathname).toEqual(`/course/${courseId}/pages-and-resources`));
    });

    test('requires confirmation if changing provider', async () => {
      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courses/v1/courses/${courseId}?username=abc123`).reply(200, courseDetailResponse);
      await executeThunk(fetchCourseDetail(courseId), store.dispatch);
      history.push(`/course/${courseId}/pages-and-resources/discussion`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      userEvent.click(getByRole(container, 'checkbox', { name: 'Select Discourse' }));
      userEvent.click(getByRole(container, 'button', { name: 'Next' }));

      await findByRole(container, 'button', { name: 'Save' });
      userEvent.type(getByRole(container, 'textbox', { name: 'Consumer Key' }), 'key');
      userEvent.type(getByRole(container, 'textbox', { name: 'Consumer Secret' }), 'secret');
      userEvent.type(getByRole(container, 'textbox', { name: 'Launch URL' }), 'http://example.test');
      userEvent.click(getByRole(container, 'button', { name: 'Save' }));

      await waitFor(() => expect(getByRole(container, 'dialog', { name: 'OK' })).toBeInTheDocument());
    });

    test('can cancel confirmation', async () => {
      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/courses/v1/courses/${courseId}?username=abc123`).reply(200, courseDetailResponse);
      await executeThunk(fetchCourseDetail(courseId), store.dispatch);
      history.push(`/course/${courseId}/pages-and-resources/discussion`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      const discourseBox = getByRole(container, 'checkbox', { name: 'Select Discourse' });
      expect(discourseBox).not.toBeDisabled();
      userEvent.click(discourseBox);

      userEvent.click(getByRole(container, 'button', { name: 'Next' }));
      await waitForElementToBeRemoved(screen.getByRole('status'));
      expect(getByRole(container, 'heading', { name: 'Discourse' })).toBeInTheDocument();

      userEvent.type(getByRole(container, 'textbox', { name: 'Consumer Key' }), 'a');
      userEvent.type(getByRole(container, 'textbox', { name: 'Consumer Secret' }), 'secret');
      userEvent.type(getByRole(container, 'textbox', { name: 'Launch URL' }), 'http://example.test');
      userEvent.click(getByRole(container, 'button', { name: 'Save' }));

      await waitFor(() => expect(getByRole(container, 'dialog', { name: 'OK' })).toBeInTheDocument());
      userEvent.click(getByRole(container, 'button', { name: 'Cancel' }));

      expect(queryByRole(container, 'dialog', { name: 'Confirm' })).not.toBeInTheDocument();
      expect(queryByRole(container, 'dialog', { name: 'Configure discussion' }));
    });
  });

  describe('with network error fetchProviders API requests', () => {
    beforeEach(() => {
      // Expedient way of getting SUPPORT_URL into config.
      setConfig({
        ...getConfig(),
        SUPPORT_URL: 'http://support.edx.org',
      });

      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).networkError();
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).networkError();
      renderComponent();
    });

    test('shows connection error alert', async () => {
      history.push(`/course/${courseId}/pages-and-resources/discussion`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      const alert = queryByRole(container, 'alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toEqual(expect.stringContaining('We encountered a technical error when loading this page.'));
      expect(alert.innerHTML).toEqual(expect.stringContaining(getConfig().SUPPORT_URL));
    });
  });

  describe('with network error postAppConfig API requests', () => {
    beforeEach(() => {
      // Expedient way of getting SUPPORT_URL into config.
      setConfig({
        ...getConfig(),
        SUPPORT_URL: 'http://support.edx.org',
      });

      axiosMock.onGet(getDiscussionsProvidersUrl(courseId))
        .reply(200, generateProvidersApiResponse());
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId))
        .reply(200, piazzaApiResponse);
      axiosMock.onPost(getDiscussionsSettingsUrl(courseId)).networkError();
      renderComponent();
    });

    test('shows connection error alert at top of form', async () => {
      history.push(`/course/${courseId}/pages-and-resources/discussion/configure/piazza`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      // Apply causes an async action to take place
      act(() => {
        userEvent.click(queryByText(container, appMessages.saveButton.defaultMessage));
      });

      await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

      expect(queryByTestId(container, 'appConfigForm')).toBeInTheDocument();
      const alert = await findByRole(container, 'alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toEqual(expect.stringContaining('We encountered a technical error when applying changes.'));
      expect(alert.innerHTML).toEqual(expect.stringContaining(getConfig().SUPPORT_URL));
    });
  });

  describe('with permission denied error for fetchProviders API requests', () => {
    beforeEach(() => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(403);
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(403);

      renderComponent();
    });

    test('shows permission denied alert', async () => {
      history.push(`/course/${courseId}/pages-and-resources/discussion`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      const alert = queryByRole(container, 'alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toEqual(expect.stringContaining('You are not authorized to view this page.'));
    });
  });

  describe('with permission denied error for postAppConfig API requests', () => {
    beforeEach(() => {
      axiosMock.onGet(getDiscussionsProvidersUrl(courseId))
        .reply(200, generateProvidersApiResponse());
      axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, piazzaApiResponse);
      axiosMock.onPost(getDiscussionsSettingsUrl(courseId)).reply(403);

      renderComponent();
    });

    test('shows permission denied alert at top of form', async () => {
      history.push(`/course/${courseId}/pages-and-resources/discussion/configure/piazza`);

      // This is an important line that ensures the spinner has been removed - and thus our main
      // content has been loaded - prior to proceeding with our expectations.
      await waitForElementToBeRemoved(screen.getByRole('status'));

      userEvent.click(getByRole(container, 'button', { name: 'Save' }));

      await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

      expect(queryByTestId(container, 'appList')).not.toBeInTheDocument();
      expect(queryByTestId(container, 'appConfigForm')).not.toBeInTheDocument();

      // We don't technically leave the route in this case, though the modal is hidden.
      expect(window.location.pathname).toEqual(`/course/${courseId}/pages-and-resources/discussion/configure/piazza`);

      const alert = await findByRole(container, 'alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toEqual(expect.stringContaining('You are not authorized to view this page.'));
    });
  });
});

describe.each([
  { isAdmin: false, isAdminOnlyConfig: false },
  { isAdmin: false, isAdminOnlyConfig: true },
  { isAdmin: true, isAdminOnlyConfig: false },
  { isAdmin: true, isAdminOnlyConfig: true },
])('LTI Admin only config test', ({ isAdmin, isAdminOnlyConfig }) => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: isAdmin,
        roles: [],
      },
    });

    store = initializeStore({
      models: {
        courseDetails: {
          [courseId]: {},
        },
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    // Leave the DiscussionsSettings route after the test.
    history.push(`/course/${courseId}/pages-and-resources`);
    axiosMock.onGet(getDiscussionsProvidersUrl(courseId))
      .reply(200, generateProvidersApiResponse(isAdminOnlyConfig));
    axiosMock.onGet(getDiscussionsSettingsUrl(courseId))
      .reply(200, generatePiazzaApiResponse(true));
    renderComponent();
  });

  test(`successfully advances to settings step for lti when adminOnlyConfig=${isAdminOnlyConfig} and user ${isAdmin ? 'is' : 'is not'} admin `, async () => {
    const showLTIConfig = isAdmin;
    history.push(`/course/${courseId}/pages-and-resources/discussion`);

    // This is an important line that ensures the spinner has been removed - and thus our main
    // content has been loaded - prior to proceeding with our expectations.
    await waitForElementToBeRemoved(screen.getByRole('status'));

    userEvent.click(queryByLabelText(container, 'Select Piazza'));
    userEvent.click(queryByText(container, messages.nextButton.defaultMessage));
    await waitForElementToBeRemoved(screen.getByRole('status'));

    if (showLTIConfig) {
      expect(queryByText(container, ltiMessages.formInstructions.defaultMessage)).toBeInTheDocument();
      expect(queryByTestId(container, 'ltiConfigFields')).toBeInTheDocument();
    } else {
      expect(queryByText(container, ltiMessages.formInstructions.defaultMessage)).not.toBeInTheDocument();
      expect(queryByTestId(container, 'ltiConfigFields')).not.toBeInTheDocument();
    }
  });
});

describe.each([
  { piiSharingAllowed: false },
  { piiSharingAllowed: true },
])('PII sharing fields test', ({ piiSharingAllowed }) => {
  const enablePIISharing = false;

  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore({
      models: {
        courseDetails: {
          [courseId]: {},
        },
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    // Leave the DiscussionsSettings route after the test.
    history.push(`/course/${courseId}/pages-and-resources`);
    axiosMock.onGet(getDiscussionsProvidersUrl(courseId))
      .reply(200, generateProvidersApiResponse(false));
    axiosMock.onGet(getDiscussionsSettingsUrl(courseId))
      .reply(200, generatePiazzaApiResponse(piiSharingAllowed));
    renderComponent();
  });

  test(`${piiSharingAllowed ? 'shows PII share username/email field when piiSharingAllowed is true'
    : 'hides PII share username/email field when piiSharingAllowed is false'}`, async () => {
    history.push(`/course/${courseId}/pages-and-resources/discussion`);

    // This is an important line that ensures the spinner has been removed - and thus our main
    // content has been loaded - prior to proceeding with our expectations.
    await waitForElementToBeRemoved(screen.getByRole('status'));

    userEvent.click(queryByLabelText(container, 'Select Piazza'));
    userEvent.click(queryByText(container, messages.nextButton.defaultMessage));
    await waitForElementToBeRemoved(screen.getByRole('status'));
    if (enablePIISharing) {
      expect(queryByTestId(container, 'piiSharingFields')).toBeInTheDocument();
    } else {
      expect(queryByTestId(container, 'piiSharingFields')).not.toBeInTheDocument();
    }
  });
});

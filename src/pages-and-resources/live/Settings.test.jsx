import {
  render,
  act,
  fireEvent,
  waitFor,
  queryByRole,
  queryByTestId,
  queryByText,
} from '@testing-library/react';

import { Switch } from 'react-router-dom';
import { initializeMockApp, history } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider, PageRoute } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import LiveSettings from './Settings';
import {
  generateLiveConfigurationApiResponse,
  courseId,
  initialState,
} from './factories/mockApiResponses';

import { fetchLiveConfiguration } from './data/thunks';
import { providerConfigurationApiUrl } from './data/api';
import messages from './messages';
import PagesAndResourcesProvider from '../PagesAndResourcesProvider';

let axiosMock;
let container;
let store;
const liveSettingsUrl = `/course/${courseId}/pages-and-resources/live/settings`;

const renderComponent = async () => {
  const wrapper = await render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <PagesAndResourcesProvider courseId={courseId}>
          <Switch>
            <PageRoute path={liveSettingsUrl}>
              <LiveSettings onClose={() => {}} />
            </PageRoute>
          </Switch>
        </PagesAndResourcesProvider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
};

describe('LiveSettings', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: [],
      },
    });
    store = initializeStore(initialState);
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    history.push(liveSettingsUrl);
  });

  test('Live Configuration modal is visible', async () => {
    await renderComponent();
    expect(queryByRole(container, 'dialog')).toBeVisible();
  });

  test('Displays "Configure Live" heading', async () => {
    await renderComponent();
    const headingElement = queryByTestId(container, 'modal-title');
    expect(headingElement).toHaveTextContent(messages.heading.defaultMessage);
  });

  test('Displays title, helper and badge when live configuration button is enabled', async () => {
    await renderComponent();
    const label = container.querySelector('label[for="enable-live-toggle"]');
    const helperText = queryByTestId(container, 'helper-text');
    expect(label).toHaveTextContent(messages.enableLiveLabel.defaultMessage);
    expect(label.firstChild).toHaveTextContent('Enabled');
    expect(helperText).toHaveTextContent(
      messages.providerHelperText.defaultMessage.replace('{providerName}', 'Zoom'),
    );
  });

  test(' Displays title, helper and hides badge when live configuration button is disabled', async () => {
    const fetchProviderConfigUrl = `${providerConfigurationApiUrl}/${courseId}/`;
    axiosMock.onGet(fetchProviderConfigUrl).reply(
      200,
      generateLiveConfigurationApiResponse(false, false),
    );
    await executeThunk(fetchLiveConfiguration(courseId), store.dispatch);
    await renderComponent();
    const label = container.querySelector('label[for="enable-live-toggle"]');
    const helperText = queryByTestId(container, 'helper-text');
    expect(label).toHaveTextContent('Live');
    expect(label.firstChild).not.toHaveTextContent('Enabled');
    expect(helperText).toHaveTextContent(
      messages.providerHelperText.defaultMessage.replace('{providerName}', 'Zoom'),
    );
  });

  test('Displays provider heading, helper and all providers', async () => {
    const fetchProviderConfigUrl = `${providerConfigurationApiUrl}/${courseId}/`;
    axiosMock.onGet(fetchProviderConfigUrl).reply(
      200,
      generateLiveConfigurationApiResponse(false, false),
    );
    await executeThunk(fetchLiveConfiguration(courseId), store.dispatch);
    await renderComponent();
    const providers = queryByRole(container, 'group');
    const helperText = queryByTestId(container, 'helper-text');
    expect(providers.childElementCount).toBe(1);
    expect(providers).toHaveTextContent('Zoom');
    expect(helperText).toHaveTextContent(
      messages.providerHelperText.defaultMessage.replace('{providerName}', 'Zoom'),
    );
  });

  test('Only helper text and lti fields are visible when pii sharing is enabled', async () => {
    const fetchProviderConfigUrl = `${providerConfigurationApiUrl}/${courseId}/`;
    axiosMock.onGet(fetchProviderConfigUrl).reply(
      200,
      generateLiveConfigurationApiResponse(),
    );
    await executeThunk(fetchLiveConfiguration(courseId), store.dispatch);
    await renderComponent();

    const consumerKey = container.querySelector('input[name="consumerKey"]').parentElement;
    const consumerSecret = container.querySelector('input[name="consumerSecret"]').parentElement;
    const launchUrl = container.querySelector('input[name="launchUrl"]').parentElement;
    const launchEmail = container.querySelector('input[name="launchEmail"]').parentElement;

    expect(consumerKey.firstChild).toBeVisible();
    expect(consumerKey.lastChild).toHaveTextContent(messages.consumerKey.defaultMessage);
    expect(consumerSecret.firstChild).toBeVisible();
    expect(consumerSecret.lastChild).toHaveTextContent(messages.consumerSecret.defaultMessage);
    expect(launchUrl.firstChild).toBeVisible();
    expect(launchUrl.lastChild).toHaveTextContent(messages.launchUrl.defaultMessage);
    expect(launchEmail.firstChild).toBeVisible();
    expect(launchEmail.lastChild).toHaveTextContent(messages.launchEmail.defaultMessage);
  });

  test('Only connect to support is visible when pii sharing is disabled', async () => {
    const fetchProviderConfigUrl = `${providerConfigurationApiUrl}/${courseId}/`;
    axiosMock.onGet(fetchProviderConfigUrl).reply(
      200,
      generateLiveConfigurationApiResponse(false, false),
    );
    await executeThunk(fetchLiveConfiguration(courseId), store.dispatch);
    await renderComponent();
    const requestPiiText = queryByTestId(container, 'request-pii-sharing');
    const consumerKey = container.querySelector('input[name="consumerKey"]');
    const consumerSecret = container.querySelector('input[name="consumerSecret"]');
    const launchUrl = container.querySelector('input[name="launchUrl"]');
    const launchEmail = container.querySelector('input[name="launchEmail"]');

    expect(requestPiiText).toHaveTextContent(
      messages.requestPiiSharingEnable.defaultMessage,
    );
    expect(consumerKey).not.toBeInTheDocument();
    expect(consumerSecret).not.toBeInTheDocument();
    expect(launchUrl).not.toBeInTheDocument();
    expect(launchEmail).not.toBeInTheDocument();
  });

  test('Form should be submitted and closed when valid data is provided', async () => {
    const fetchProviderConfigUrl = `${providerConfigurationApiUrl}/${courseId}/`;
    const apiDefaultResponse = generateLiveConfigurationApiResponse();
    axiosMock.onPost(fetchProviderConfigUrl, apiDefaultResponse).reply(200, apiDefaultResponse);
    axiosMock.onGet(fetchProviderConfigUrl).reply(200, apiDefaultResponse);
    await executeThunk(fetchLiveConfiguration(courseId), store.dispatch);
    await renderComponent();
    const saveButton = queryByText(container, 'Save');
    await waitFor(async () => {
      await act(async () => fireEvent.click(saveButton));
      expect(queryByRole(container, 'dialog')).not.toBeInTheDocument();
    });
  });

  test('Provider Configuration should be displayed correctly', async () => {
    const fetchProviderConfigUrl = `${providerConfigurationApiUrl}/${courseId}/`;
    const apiDefaultResponse = generateLiveConfigurationApiResponse();
    axiosMock.onGet(fetchProviderConfigUrl).reply(200, apiDefaultResponse);
    await executeThunk(fetchLiveConfiguration(courseId), store.dispatch);
    await renderComponent();

    const consumerKey = container.querySelector('input[name="consumerKey"]');
    const consumerSecret = container.querySelector('input[name="consumerSecret"]');
    const launchUrl = container.querySelector('input[name="launchUrl"]');
    const launchEmail = container.querySelector('input[name="launchEmail"]');

    expect(consumerKey.value).toBe(apiDefaultResponse.lti_configuration.lti_1p1_client_key);
    expect(consumerSecret.value).toBe(apiDefaultResponse.lti_configuration.lti_1p1_client_secret);
    expect(launchUrl.value).toBe(apiDefaultResponse.lti_configuration.lti_1p1_launch_url);
    expect(launchEmail.value).toBe(
      apiDefaultResponse.lti_configuration.lti_config.additional_parameters.custom_instructor_email,
    );
  });

  test('Unable to save error should be shown on submission if a field is empty', async () => {
    const fetchProviderConfigUrl = `${providerConfigurationApiUrl}/${courseId}/`;
    const apiDefaultResponse = generateLiveConfigurationApiResponse();
    apiDefaultResponse.lti_configuration.lti_1p1_client_key = '';

    axiosMock.onGet(fetchProviderConfigUrl).reply(200, apiDefaultResponse);
    await executeThunk(fetchLiveConfiguration(courseId), store.dispatch);

    await renderComponent();
    const saveButton = queryByText(container, 'Save');
    await waitFor(async () => {
      await act(async () => fireEvent.click(saveButton));
      expect(queryByRole(container, 'alert')).toBeVisible();
    });
  });
});

import {
  render,
  act,
  fireEvent,
  waitFor,
  queryByRole,
  queryByTestId,
  queryByText,
  getByRole,
  waitForElementToBeRemoved,
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
  configurationProviders,
} from './factories/mockApiResponses';

import { fetchLiveConfiguration, fetchLiveProviders } from './data/thunks';
import { providerConfigurationApiUrl, providersApiUrl } from './data/api';
import messages from './messages';
import PagesAndResourcesProvider from '../PagesAndResourcesProvider';

let axiosMock;
let container;
let store;
const liveSettingsUrl = `/course/${courseId}/pages-and-resources/live/settings`;

const renderComponent = () => {
  const wrapper = render(
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

const mockStore = async ({
 usernameSharing = false,
 emailSharing = false,
 enabled = true,
 piiSharingAllowed = true,
}) => {
  const fetchProviderConfigUrl = `${providersApiUrl}/${courseId}/`;
  const fetchLiveConfigUrl = `${providerConfigurationApiUrl}/${courseId}/`;

  axiosMock.onGet(fetchProviderConfigUrl).reply(200, configurationProviders(emailSharing, usernameSharing));
  axiosMock.onGet(fetchLiveConfigUrl).reply(200, generateLiveConfigurationApiResponse(enabled, piiSharingAllowed));

  await executeThunk(fetchLiveProviders(courseId), store.dispatch);
  await executeThunk(fetchLiveConfiguration(courseId), store.dispatch);
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
    renderComponent();

    expect(queryByRole(container, 'dialog')).toBeVisible();
  });

  test('Displays "Configure Live" heading', async () => {
    renderComponent();

    const headingElement = queryByTestId(container, 'modal-title');

    expect(headingElement).toHaveTextContent(messages.heading.defaultMessage);
  });

  test('Displays title, helper text and badge when live configuration button is enabled', async () => {
    await mockStore({ enabled: true });
    renderComponent();

    const label = container.querySelector('label[for="enable-live-toggle"]');
    const helperText = container.querySelector('#enable-live-toggleHelpText');
    const enableBadge = queryByTestId(container, 'enable-badge');

    expect(label).toHaveTextContent(messages.enableLiveLabel.defaultMessage);
    expect(enableBadge).toHaveTextContent('Enabled');
    expect(helperText).toHaveTextContent(messages.enableLiveHelp.defaultMessage);
  });

  test('Displays title, helper text and hides badge when live configuration button is disabled', async () => {
    await mockStore({ enabled: false, piiSharingAllowed: false });
    renderComponent();

    const label = container.querySelector('label[for="enable-live-toggle"]');
    const helperText = container.querySelector('#enable-live-toggleHelpText');

    expect(label).toHaveTextContent('Live');
    expect(label.firstChild).not.toHaveTextContent('Enabled');
    expect(helperText).toHaveTextContent(messages.enableLiveHelp.defaultMessage);
  });

  test('Displays provider heading, helper text and all providers', async () => {
    await mockStore({
      enabled: true,
      piiSharingAllowed: true,
      usernameSharing: false,
      emailSharing: true,
    });
    renderComponent();

    const spinner = getByRole(container, 'status');
    await waitForElementToBeRemoved(spinner);
    const providers = queryByRole(container, 'group');
    const helperText = queryByTestId(container, 'helper-text');

    expect(providers.childElementCount).toBe(2);
    expect(providers).toHaveTextContent('Zoom');
    expect(helperText).toHaveTextContent(
      messages.providerHelperText.defaultMessage.replace('{providerName}', 'zoom'),
    );
  });

  test('LTI fields are visible when pii sharing is enabled and email or username sharing required', async () => {
    await mockStore({ emailSharing: true });
    renderComponent();

    const spinner = getByRole(container, 'status');
    await waitForElementToBeRemoved(spinner);

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

  test(
    'Only connect to support message is visible when pii sharing is disabled and email or username sharing is required',
    async () => {
        await mockStore({ emailSharing: true, piiSharingAllowed: false });
        renderComponent();

        const spinner = getByRole(container, 'status');
        await waitForElementToBeRemoved(spinner);

        const requestPiiText = queryByTestId(container, 'request-pii-sharing');
        const consumerKey = container.querySelector('input[name="consumerKey"]');
        const consumerSecret = container.querySelector('input[name="consumerSecret"]');
        const launchUrl = container.querySelector('input[name="launchUrl"]');
        const launchEmail = container.querySelector('input[name="launchEmail"]');

        expect(requestPiiText).toHaveTextContent(
          messages.requestPiiSharingEnable.defaultMessage.replaceAll('{provider}', 'zoom'),
        );
        expect(consumerKey).not.toBeInTheDocument();
        expect(consumerSecret).not.toBeInTheDocument();
        expect(launchUrl).not.toBeInTheDocument();
        expect(launchEmail).not.toBeInTheDocument();
    },
  );

  test('Provider Configuration should be displayed correctly', async () => {
    const apiDefaultResponse = generateLiveConfigurationApiResponse(true, true);
    await mockStore({ emailSharing: false, piiSharingAllowed: false });
    renderComponent();

    const spinner = getByRole(container, 'status');
    await waitForElementToBeRemoved(spinner);

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
    const apiDefaultResponse = generateLiveConfigurationApiResponse(true, true);
    apiDefaultResponse.lti_configuration.lti_1p1_client_key = '';
    await mockStore({ emailSharing: false, piiSharingAllowed: false });
    renderComponent();

    const spinner = getByRole(container, 'status');
    await waitForElementToBeRemoved(spinner);

    const saveButton = queryByText(container, 'Save');

    await waitFor(async () => {
      await act(async () => fireEvent.click(saveButton));
      expect(queryByRole(container, 'alert')).toBeVisible();
    });
  });
});

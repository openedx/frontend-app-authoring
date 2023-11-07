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

import ReactDOM from 'react-dom';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider, PageWrap } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from 'CourseAuthoring/store';
import { executeThunk } from 'CourseAuthoring/utils';
import PagesAndResourcesProvider from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';

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

let axiosMock;
let container;
let store;
const liveSettingsUrl = `/course/${courseId}/pages-and-resources/live/settings`;

// Modal creates a portal. Overriding ReactDOM.createPortal allows portals to be tested in jest.
ReactDOM.createPortal = jest.fn(node => node);

const renderComponent = () => {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store} wrapWithRouter={false}>
        <PagesAndResourcesProvider courseId={courseId}>
          <MemoryRouter initialEntries={[liveSettingsUrl]}>
            <Routes>
              <Route path={liveSettingsUrl} element={<PageWrap><LiveSettings onClose={() => {}} /></PageWrap>} />
            </Routes>
          </MemoryRouter>
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
    expect(providers).toHaveTextContent('BigBlueButton');
    expect(helperText).toHaveTextContent(
      messages.providerHelperText.defaultMessage.replace('{providerName}', 'Zoom'),
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

import {
  render,
  queryByTestId,
  getByRole,
  getAllByRole,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import ReactDOM from 'react-dom';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider, PageWrap } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import userEvent from '@testing-library/user-event';
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
  isFreeTier = false,
}) => {
  const fetchProviderConfigUrl = `${providersApiUrl}/${courseId}/`;
  const fetchLiveConfigUrl = `${providerConfigurationApiUrl}/${courseId}/`;

  axiosMock.onGet(fetchProviderConfigUrl).reply(200, configurationProviders(emailSharing, usernameSharing, 'big_blue_button', isFreeTier));
  axiosMock.onGet(fetchLiveConfigUrl).reply(200, generateLiveConfigurationApiResponse(enabled, piiSharingAllowed, 'bigBlueButton', isFreeTier));

  await executeThunk(fetchLiveProviders(courseId), store.dispatch);
  await executeThunk(fetchLiveConfiguration(courseId), store.dispatch);
};

describe('BBB Settings', () => {
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

  test('Plan dropdown to be visible and enabled in UI', async () => {
    await mockStore({ emailSharing: true });
    renderComponent();

    const spinner = getByRole(container, 'status');
    await waitForElementToBeRemoved(spinner);

    expect(queryByTestId(container, 'plansDropDown')).toBeInTheDocument();
    expect(container.querySelector('select[name="tierType"]')).not.toBeDisabled();
  });

  test.each([[true, 3], [false, 2]])('Plan dropdown should display correct number of options', async (isFreeTier, noOfOptions) => {
    await mockStore({ emailSharing: true, isFreeTier });
    renderComponent();
    const spinner = getByRole(container, 'status');
    await waitForElementToBeRemoved(spinner);
    const dropDown = queryByTestId(container, 'plansDropDown');
    expect(getAllByRole(dropDown, 'option').length).toBe(noOfOptions);
  });

  test(
    'Connect to support and PII sharing message is visible and plans selection is disabled, When pii sharing is disabled, ',
    async () => {
      await mockStore({ piiSharingAllowed: false });
      renderComponent();
      const spinner = getByRole(container, 'status');
      await waitForElementToBeRemoved(spinner);
      const requestPiiText = queryByTestId(container, 'request-pii-sharing');
      const helpRequestPiiText = queryByTestId(container, 'help-request-pii-sharing');
      expect(requestPiiText).toHaveTextContent(
        messages.requestPiiSharingEnableForBbb.defaultMessage.replaceAll('{provider}', 'BigBlueButton'),
      );
      expect(helpRequestPiiText).toHaveTextContent(messages.piiSharingEnableHelpTextBbb.defaultMessage);
      expect(container.querySelector('select[name="tierType"]')).toBeDisabled();
    },
  );

  test('free plans message is visible when free plan is selected', async () => {
    await mockStore({ emailSharing: true, isFreeTier: true });
    renderComponent();
    const spinner = getByRole(container, 'status');
    await waitForElementToBeRemoved(spinner);
    const dropDown = container.querySelector('select[name="tierType"]');
    userEvent.selectOptions(
      dropDown,
      getByRole(dropDown, 'option', { name: 'Free' }),
    );
    expect(queryByTestId(container, 'free-plan-message')).toBeInTheDocument();
    expect(queryByTestId(container, 'free-plan-message')).toHaveTextContent(messages.freePlanMessage.defaultMessage);
  });
});

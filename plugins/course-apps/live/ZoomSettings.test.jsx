import {
  render,
  queryByTestId,
  getByRole,
  waitForElementToBeRemoved,
  initializeMocks,
} from 'CourseAuthoring/testUtils';

import ReactDOM from 'react-dom';

import { executeThunk } from 'CourseAuthoring/utils';
import PagesAndResourcesProvider from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
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
    <CourseAuthoringProvider courseId={courseId}>
      <PagesAndResourcesProvider courseId={courseId}>
        <LiveSettings onClose={() => {}} />
      </PagesAndResourcesProvider>
    </CourseAuthoringProvider>,
    {
      path: liveSettingsUrl,
      routerProps: {
        initialEntries: [liveSettingsUrl],
      },
      params: {
        courseId,
      },
    },
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

describe('Zoom Settings', () => {
  beforeEach(async () => {
    const mocks = initializeMocks({ initialState });
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
  });

  test('LTI fields are visible when pii sharing is enabled', async () => {
    await mockStore({ piiSharingAllowed: true });
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
    'Only connect to support message is visible when pii sharing is disabled',
    async () => {
      await mockStore({ piiSharingAllowed: false });
      renderComponent();

      const spinner = getByRole(container, 'status');
      await waitForElementToBeRemoved(spinner);

      const requestPiiText = queryByTestId(container, 'request-pii-sharing');
      const consumerKey = container.querySelector('input[name="consumerKey"]');
      const consumerSecret = container.querySelector('input[name="consumerSecret"]');
      const launchUrl = container.querySelector('input[name="launchUrl"]');
      const launchEmail = container.querySelector('input[name="launchEmail"]');

      expect(requestPiiText).toHaveTextContent(
        messages.requestPiiSharingEnable.defaultMessage.replaceAll('{provider}', 'Zoom'),
      );
      expect(consumerKey).not.toBeInTheDocument();
      expect(consumerSecret).not.toBeInTheDocument();
      expect(launchUrl).not.toBeInTheDocument();
      expect(launchEmail).not.toBeInTheDocument();
    },
  );

  test('Provider Configuration should be displayed correctly', async () => {
    const apiDefaultResponse = generateLiveConfigurationApiResponse(true, true);
    await mockStore({ piiSharingAllowed: true });
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
});

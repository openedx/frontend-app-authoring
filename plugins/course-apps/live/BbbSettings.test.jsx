import {
  render,
  queryByTestId,
  getByRole,
  getAllByRole,
  waitForElementToBeRemoved,
  initializeMocks,
} from 'CourseAuthoring/testUtils';

import ReactDOM from 'react-dom';

import userEvent from '@testing-library/user-event';
import { executeThunk } from 'CourseAuthoring/utils';
import PagesAndResourcesProvider from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';

import { CourseAuthoringProvider } from 'CourseAuthoring/CourseAuthoringContext';
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
    const mocks = initializeMocks({ initialState });
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
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
    const user = userEvent.setup();
    await mockStore({ emailSharing: true, isFreeTier: true });
    renderComponent();
    const spinner = getByRole(container, 'status');
    await waitForElementToBeRemoved(spinner);
    const dropDown = container.querySelector('select[name="tierType"]');
    await user.selectOptions(
      dropDown,
      getByRole(dropDown, 'option', { name: 'Free' }),
    );
    expect(queryByTestId(container, 'free-plan-message')).toBeInTheDocument();
    expect(queryByTestId(container, 'free-plan-message')).toHaveTextContent(messages.freePlanMessage.defaultMessage);
  });
});

import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import { render, queryByLabelText } from '@testing-library/react';

import AppCard from './AppCard';
import messages from './messages';
import initializeStore from '../../../store';
import { executeThunk } from '../../../utils';
import { getAppsUrl } from '../data/api';
import { fetchApps } from '../data/thunks';
import { legacyApiResponse } from '../factories/mockApiResponses';

const courseId = 'course-v1:edX+TestX+Test_Course';
const selected = true;
const app = {
  id: 'legacy',
  hasFullSupport: true,
  featureIds: ['discussion-page', 'embedded-course-sections', 'wcag-2.1'],
};

describe('AppCard', () => {
  let axiosMock;
  let store;
  let container;

  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = await initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  const mockStore = async (mockResponse) => {
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, mockResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
  };

  const createComponent = (data) => {
    const wrapper = render(
      <AppProvider store={store}>
        <IntlProvider locale="en">
          <AppCard
            app={data}
            onClick={() => jest.fn()}
            selected={selected}
            features={[]}
          />
        </IntlProvider>
      </AppProvider>,
    );
    container = wrapper.container;
    return container;
  };

  test('checkbox input is checked when AppCard is selected', async () => {
    const labelText = `Select ${messages[`appName-${app.id}`].defaultMessage}`;

    await mockStore(legacyApiResponse);
    createComponent(app);

    expect(container.querySelector('[role="radio"]')).toBeChecked();
    expect(queryByLabelText(container, labelText, { selector: 'input[type="checkbox"]' })).toBeChecked();
  });

  test.each([
    [true],
    [false],
  ])('providerName and text from the app are displayed with full support %s', async (hasFullSupport) => {
    const appWithCustomSupport = { ...app, hasFullSupport };
    const title = messages[`appName-${appWithCustomSupport.id}`].defaultMessage;
    const text = messages[`appDescription-${appWithCustomSupport.id}`].defaultMessage;

    await mockStore(legacyApiResponse);
    createComponent(appWithCustomSupport);

    expect(container.querySelector('.card-title')).toHaveTextContent(title);
    expect(container.querySelector('.card-text')).toHaveTextContent(text);
  });

  test('full support subtitle shown when hasFullSupport is true', async () => {
    const subtitle = messages.appFullSupport.defaultMessage;

    await mockStore(legacyApiResponse);
    createComponent(app);

    expect(container.querySelector('.card-subtitle')).toHaveTextContent(subtitle);
  });

  test('partial support subtitle shown when hasFullSupport is false', async () => {
    const appWithBasicSupport = { ...app, hasFullSupport: false };
    const subtitle = messages.appBasicSupport.defaultMessage;

    await mockStore(legacyApiResponse);
    createComponent(appWithBasicSupport);

    expect(container.querySelector('.card-subtitle')).toHaveTextContent(subtitle);
  });
});

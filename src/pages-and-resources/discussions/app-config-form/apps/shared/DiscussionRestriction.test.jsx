import React, { createRef } from 'react';

import {
  act, fireEvent, render, screen, waitFor, within,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../../../../store';
import { executeThunk } from '../../../../../utils';
import { getDiscussionsProvidersUrl, getDiscussionsSettingsUrl } from '../../../data/api';
import { fetchDiscussionSettings, fetchProviders } from '../../../data/thunks';
import { generateProvidersApiResponse, legacyApiResponse } from '../../../factories/mockApiResponses';
import OpenedXConfigForm from '../openedx/OpenedXConfigForm';
import { selectApp } from '../../../data/slice';

const courseId = 'course-v1:edX+TestX+Test_Course';

describe('Discussion Restriction', () => {
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  const renderComponent = (onSubmit = jest.fn(), formRef = createRef(), legacy = true) => {
    const wrapper = render(
      <AppProvider store={store}>
        <IntlProvider locale="en">
          <OpenedXConfigForm
            onSubmit={onSubmit}
            formRef={formRef}
            legacy={legacy}
          />
        </IntlProvider>
      </AppProvider>,
    );
    container = wrapper.container;
    return container;
  };

  const mockStore = async (mockResponse) => {
    axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse());
    axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, mockResponse);
    await executeThunk(fetchProviders(courseId), store.dispatch);
    await executeThunk(fetchDiscussionSettings(courseId), store.dispatch);
    store.dispatch(selectApp({ appId: 'legacy' }));
  };

  it(
    'Successfully displayed three types (OFF, ON and SCHEDULED) for discussion restriction and selected OFF bydefault',
    async () => {
      const mockData = legacyApiResponse;
      mockData.posting_restrictions = 'disabled';

      await mockStore(mockData);
      renderComponent();

      expect(screen.queryByTestId('disabled')).toBeInTheDocument();
      expect(screen.queryByTestId('enabled')).toBeInTheDocument();
      expect(screen.queryByTestId('scheduled')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="disabled"].selected-button')).toBeInTheDocument();
    },
  );

  it.each([
    { eventType: 'OK', description: 'ON option, when user clicks on ok button', selectedOption: 'enabled' },
    { eventType: 'Cancel', description: 'OFF option, when user clicks on cancel button', selectedOption: 'disabled' },
  ])('Successfully selected %s of the popup displays under ON option.', async ({ eventType, selectedOption }) => {
    await mockStore(legacyApiResponse);
    renderComponent();

    const onButton = screen.queryByTestId('enabled');

    await act(async () => { fireEvent.click(onButton); });

    const eventButton = await screen.findByText(eventType);

    await act(async () => { fireEvent.click(eventButton); });

    await waitFor(() => {
      expect(container.querySelector(`[data-testid= ${selectedOption}].selected-button`)).toBeInTheDocument();
    });
  });

  it.each([
    { eventType: 'Cancel', description: 'retained the added restricted dates by clicking on cancel button' },
    { eventType: 'Delete', description: 'removed the added restricted dates by clicking on confirm button' },
  ])('Successfully added new restricted dates and %s', async ({ eventType }) => {
    await mockStore(legacyApiResponse);
    renderComponent();

    const scheduledButton = screen.queryByTestId('scheduled');

    await act(async () => { fireEvent.click(scheduledButton); });

    const addDatesButton = screen.queryByText('Add restricted dates');

    await act(async () => { fireEvent.click(addDatesButton); });
    await waitFor(async () => {
      const startDate = screen.getByTestId('startDate');
      const startTime = screen.getByTestId('startTime');
      const endDate = screen.getByTestId('endDate');
      const endTime = screen.getByTestId('endTime');

      fireEvent.focus(startDate);
      fireEvent.change(startDate, { target: { value: '2023-08-09' } });
      fireEvent.blur(startDate);
      fireEvent.change(startTime, { target: { value: '18:03' } });
      fireEvent.change(endDate, { target: { value: '2024-08-09' } });
      fireEvent.change(endTime, { target: { value: '18:03' } });

      expect(startDate.value).toEqual('2023-08-09');
      expect(startTime.value).toEqual('18:03');
      expect(endDate.value).toEqual('2024-08-09');
      expect(endTime.value).toEqual('18:03');

      const deleteButton = screen.getByLabelText('Delete Topic');

      await act(async () => { fireEvent.click(deleteButton); });

      const eventButton = screen.getByText(eventType);

      await act(async () => { fireEvent.click(eventButton); });
      await waitFor(() => {
        const configureLabel = screen.queryByText('Configure restricted date range');

        if (eventType === 'Cancel') {
          expect(configureLabel).toBeInTheDocument();
        } else {
          expect(configureLabel).not.toBeInTheDocument();
        }
      });
    });
  });

  it('Successfully displayed existing discussion restriction dates.', async () => {
    const mockData = legacyApiResponse;
    mockData.plugin_configuration.discussion_blackouts = ['2023-08-09T18:03'];
    mockData.posting_restrictions = 'scheduled';

    await mockStore(mockData);
    renderComponent();

    const restrictionSchedules = screen.queryByTestId('restriction-schedules');
    const scheduledBadge = restrictionSchedules.querySelector('.badge');

    expect(scheduledBadge).toBeInTheDocument();
  });

  it('Successfully Expand/Collapse discussion restriction dates container.', async () => {
    const mockData = legacyApiResponse;
    mockData.plugin_configuration.discussion_blackouts = ['2023-08-09T18:03'];
    mockData.posting_restrictions = 'scheduled';

    await mockStore(mockData);
    renderComponent();

    const restrictionSchedules = screen.queryByTestId('restriction-schedules');
    const expandBtn = within(restrictionSchedules).getByRole('button', { name: 'Expand' });

    await act(async () => { fireEvent.click(expandBtn); });

    let configureLabel = screen.queryByText('Configure restricted date range');

    expect(configureLabel).toBeInTheDocument();

    const collapseBtn = within(restrictionSchedules).getByRole('button', { name: 'Collapse' });

    await act(async () => { fireEvent.click(collapseBtn); });

    configureLabel = screen.queryByText('Configure restricted date range');

    expect(configureLabel).not.toBeInTheDocument();
  });
});

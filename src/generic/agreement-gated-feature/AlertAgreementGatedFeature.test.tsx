import { initializeMockApp, mergeConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { AgreementGated } from '@src/constants';
import { getUserAgreementApi, getUserAgreementRecordApi } from '@src/data/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { AlertAgreementGatedFeature } from './AlertAgreementGatedFeature';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

async function renderComponent(gatingTypes: AgreementGated[]) {
  return render(
    <AppProvider>

      <QueryClientProvider client={queryClient}>
        <AlertAgreementGatedFeature gatingTypes={gatingTypes} />
      </QueryClientProvider>,
    </AppProvider>,
  );
}

describe('AlertAgreementGatedFeature', () => {
  let axiosMock;
  beforeAll(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });
  beforeEach(() => {
    axiosMock.onGet(getUserAgreementApi('agreement1')).reply(200, {
      type: 'agreement1',
      name: 'agreement1',
      summary: 'summary1',
      has_text: true,
      url: 'https://example.com/agreement1',
      updated: '2023-01-01T00:00:00Z',
    });
    axiosMock.onGet(getUserAgreementApi('agreement2')).reply(200, {
      type: 'agreement2',
      name: 'agreement2',
      summary: 'summary2',
      has_text: true,
      url: 'https://example.com/agreement2',
    });
    axiosMock.onGet(getUserAgreementApi('agreement3')).reply(404);
    axiosMock.onGet(getUserAgreementRecordApi('agreement1')).reply(200, {});
    axiosMock.onGet(getUserAgreementRecordApi('agreement2')).reply(200, {});
    mergeConfig({
      AGREEMENT_GATING: {
        [AgreementGated.UPLOAD]: ['agreement1', 'agreement2'],
        [AgreementGated.UPLOAD_VIDEOS]: ['agreement2'],
      },
    });
  });
  afterEach(() => {
    axiosMock.reset();
  });

  it('renders no alerts when gatingTypes is empty', async () => {
    await renderComponent([]);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders no alerts when gatingTypes have no associated agreement', async () => {
    await renderComponent([AgreementGated.UPLOAD_FILES]);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders no alerts when associated agreement does not exist', async () => {
    mergeConfig({
      AGREEMENT_GATING: {
        [AgreementGated.UPLOAD_FILES]: ['agreement3'],
      },
    });
    await renderComponent([AgreementGated.UPLOAD_FILES]);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders an alert for each agreement type associated with the gating types', async () => {
    const gatingTypes = [AgreementGated.UPLOAD];
    await renderComponent(gatingTypes);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(screen.queryAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText('agreement1')).toBeInTheDocument();
    expect(screen.getByText('summary1')).toBeInTheDocument();
    expect(screen.getByText('agreement2')).toBeInTheDocument();
    expect(screen.getByText('summary2')).toBeInTheDocument();
  });

  it('renders skips alerts for agreements that have already been accepted', async () => {
    const gatingTypes = [AgreementGated.UPLOAD];
    axiosMock.onGet(getUserAgreementRecordApi('agreement2')).reply(200, { is_current: true });
    await renderComponent(gatingTypes);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(screen.queryAllByRole('alert')).toHaveLength(1);
    expect(screen.getByText('agreement1')).toBeInTheDocument();
    expect(screen.getByText('summary1')).toBeInTheDocument();
    expect(screen.queryByText('agreement2')).not.toBeInTheDocument();
    expect(screen.queryByText('summary2')).not.toBeInTheDocument();
  });

  it('does not duplicate alert if multiple gating types have the same agreement type', async () => {
    const gatingTypes = [AgreementGated.UPLOAD, AgreementGated.UPLOAD_FILES];
    await renderComponent(gatingTypes);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));

    expect(screen.queryAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText('agreement1')).toBeInTheDocument();
    expect(screen.getByText('summary1')).toBeInTheDocument();
    expect(screen.getByText('agreement2')).toBeInTheDocument();
    expect(screen.getByText('summary2')).toBeInTheDocument();
  });

  // it('passes the correct agreement type to each AlertAgreementWrapper', asyncc () => {
  //   const gatingTypes = [AgreementGated.UPLOAD, AgreementGated.UPLOAD_FILES];
  //
  //   renderComponent(gatingTypes);
  //   await waitFor(async () => !queryClient.isFetching());
  //
  //   gatingTypes.forEach(type => {
  //     expect(screen.getByText(type)).toBeInTheDocument();
  //   });
  // });
});

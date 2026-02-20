import { initializeMockApp, mergeConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { AgreementGated } from '@src/constants';
import { getUserAgreementRecordApi } from '@src/data/api';
import { GatedComponentWrapper } from '@src/generic/agreement-gated-feature/GatedComponentWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';

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
        <GatedComponentWrapper gatingTypes={gatingTypes}>
          <button type="button">
            Test button
          </button>
        </GatedComponentWrapper>
      </QueryClientProvider>,
    </AppProvider>,
  );
}

describe('GatedComponentWrapper', () => {
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
    axiosMock.onGet(getUserAgreementRecordApi('agreement1')).reply(200, {});
    axiosMock.onGet(getUserAgreementRecordApi('agreement2')).reply(200, { is_current: true });
    mergeConfig({
      AGREEMENT_GATING: {
        [AgreementGated.UPLOAD]: ['agreement1', 'agreement2'],
        [AgreementGated.UPLOAD_VIDEOS]: ['agreement2'],
        [AgreementGated.UPLOAD_FILES]: ['agreement1'],
      },
    });
  });
  afterEach(() => {
    axiosMock.reset();
  });

  it('applies no gating when gatingTypes is empty', async () => {
    await renderComponent([]);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(screen.getByRole('button').parentNode).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('applies no gating when associated agreement has been accepted', async () => {
    await renderComponent([AgreementGated.UPLOAD_VIDEOS]);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(screen.getByRole('button').parentNode).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('applies gating when associated agreement has not been accepted', async () => {
    await renderComponent([AgreementGated.UPLOAD_FILES]);
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(screen.getByRole('button').parentNode).toHaveAttribute('aria-disabled', 'true');
  });
});

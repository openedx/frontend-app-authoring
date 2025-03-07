import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import userEvent from '@testing-library/user-event';

import initializeStore from '../../../../store';
import { executeThunk } from '../../../../utils';
import { clipboardUnit } from '../../../../__mocks__';
import { getCourseUnitApiUrl } from '../../../data/api';
import { getClipboardUrl } from '../../../../generic/data/api';
import { fetchCourseUnitQuery } from '../../../data/thunk';
import { courseUnitIndexMock } from '../../../__mocks__';
import messages from '../../messages';
import ActionButtons from './ActionButtons';

let store;
let axiosMock;
let queryClient;
const courseId = '123';

const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

global.BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

const renderComponent = (props = {}) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <QueryClientProvider client={queryClient}>
        <ActionButtons {...props} />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>,
);

describe('<ActionButtons />', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getCourseUnitApiUrl(courseId))
      .reply(200, { ...courseUnitIndexMock, enable_copy_paste_units: true });
    axiosMock
      .onPost(getClipboardUrl())
      .reply(200, clipboardUnit);
    axiosMock
      .onGet(getClipboardUrl())
      .reply(200, clipboardUnit);

    queryClient = new QueryClient();

    await executeThunk(fetchCourseUnitQuery(courseId), store.dispatch);
  });

  it('render ActionButtons component with Copy to clipboard', () => {
    const { getByRole } = renderComponent();

    const copyXBlockBtn = getByRole('button', { name: messages.actionButtonCopyUnitTitle.defaultMessage });
    expect(copyXBlockBtn).toBeInTheDocument();
  });

  it('click on the Copy to clipboard button updates clipboardData', async () => {
    const { getByRole } = renderComponent();

    const copyXBlockBtn = getByRole('button', { name: messages.actionButtonCopyUnitTitle.defaultMessage });

    userEvent.click(copyXBlockBtn);
    expect(axiosMock.history.post.length).toBe(1);
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({ usage_key: courseUnitIndexMock.id }));
    jest.resetAllMocks();
  });
});

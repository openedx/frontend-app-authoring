import MockAdapter from 'axios-mock-adapter';
import { cleanup, render, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import userEvent from '@testing-library/user-event';

import { RequestStatus } from '../data/constants';
import initializeStore from '../store';
import { executeThunk } from '../utils';
import { getTextbooksApiUrl } from './data/api';
import { fetchTextbooksQuery } from './data/thunk';
import { textbooksMock } from './__mocks__';
import { Textbooks } from '.';
import messages from './messages';

let axiosMock;
let store;
const courseId = 'course-v1:org+101+101';
const emptyTextbooksMock = { textbooks: [] };

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <Textbooks courseId={courseId} />
    </IntlProvider>
  </AppProvider>,
);

describe('<Textbooks />', () => {
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
      .onGet(getTextbooksApiUrl(courseId))
      .reply(200, textbooksMock);
    await executeThunk(fetchTextbooksQuery(courseId), store.dispatch);
  });

  it('renders Textbooks component correctly', async () => {
    const {
      getByText, getByRole, getAllByTestId, queryByTestId,
    } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.breadcrumbContent.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.breadcrumbPagesAndResources.defaultMessage)).toBeInTheDocument();
      expect(getByRole('button', { name: messages.newTextbookButton.defaultMessage })).toBeInTheDocument();
      expect(getAllByTestId('textbook-card')).toHaveLength(2);
      expect(queryByTestId('textbooks-empty-placeholder')).not.toBeInTheDocument();
    });
  });

  it('renders textbooks form when "New textbooks" button is clicked', async () => {
    const { getByTestId, getByRole } = renderComponent();

    await waitFor(() => {
      const newTextbookButton = getByRole('button', { name: messages.newTextbookButton.defaultMessage });
      userEvent.click(newTextbookButton);
      expect(getByTestId('textbook-form')).toBeInTheDocument();
    });
  });

  it('renders Textbooks component with empty placeholder correctly', async () => {
    cleanup();
    axiosMock
      .onGet(getTextbooksApiUrl(courseId))
      .reply(200, emptyTextbooksMock);

    const { getByTestId, queryAllByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('textbooks-empty-placeholder')).toBeInTheDocument();
      expect(queryAllByTestId('textbook-card')).toHaveLength(0);
    });
  });

  it('displays an alert and sets status to FAILED when API responds with 403', async () => {
    axiosMock
      .onGet(getTextbooksApiUrl(courseId))
      .reply(403);
    await executeThunk(fetchTextbooksQuery(courseId), store.dispatch);
    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('connectionErrorAlert')).toBeInTheDocument();
      expect(store.getState().textbooks.loadingStatus).toBe(
        RequestStatus.FAILED,
      );
    });
  });
});

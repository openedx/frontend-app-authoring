import {
  render,
  waitFor,
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { getConfig, setConfig, initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../store';
import { RequestStatus } from '../data/constants';
import { executeThunk } from '../utils';
import { getCourseLaunchApiUrl, getCourseBestPracticesApiUrl } from './data/api';
import { fetchCourseLaunchQuery, fetchCourseBestPracticesQuery } from './data/thunks';
import {
  courseId,
  initialState,
  generateCourseLaunchData,
  generateCourseBestPracticesData,
} from './factories/mockApiResponses';
import messages from './messages';
import CourseChecklist from './index';

let axiosMock;
let store;

const renderComponent = () => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <CourseChecklist {...{ courseId }} />
      </AppProvider>
    </IntlProvider>,
  );
};

const mockStore = async (status) => {
  axiosMock.onGet(getCourseLaunchApiUrl(courseId)).reply(status, generateCourseLaunchData());
  axiosMock.onGet(getCourseBestPracticesApiUrl(courseId)).reply(status, generateCourseBestPracticesData());

  await executeThunk(fetchCourseLaunchQuery(courseId), store.dispatch);
  await executeThunk(fetchCourseBestPracticesQuery(courseId), store.dispatch);
};

describe('CourseChecklistPage', () => {
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
  describe('renders', () => {
    describe('if enable_quality prop is true', () => {
      it('two checklist components ', () => {
        renderComponent();
        mockStore(200);

        expect(screen.getByText(messages.launchChecklistLabel.defaultMessage)).toBeVisible();

        expect(screen.getByText(messages.bestPracticesChecklistLabel.defaultMessage)).toBeVisible();
      });

      describe('an aria-live region with', () => {
        it('an aria-live region', () => {
          renderComponent();
          const ariaLiveRegion = screen.getByRole('status');

          expect(ariaLiveRegion).toBeDefined();

          expect(ariaLiveRegion.classList.contains('sr-only')).toBe(true);
        });

        it('correct content when the launch checklist has loaded', async () => {
          renderComponent();
          mockStore(404);
          await waitFor(() => {
            const { launchChecklistStatus } = store.getState().courseChecklist.loadingStatus;

            expect(launchChecklistStatus).not.toEqual(RequestStatus.SUCCESSFUL);

            expect(screen.getByText(messages.launchChecklistDoneLoadingLabel.defaultMessage)).toBeInTheDocument();
          });
        });

        it('correct content when the best practices checklist is loading', async () => {
          renderComponent();
          mockStore(404);
          await waitFor(() => {
            const { bestPracticeChecklistStatus } = store.getState().courseChecklist.loadingStatus;

            expect(bestPracticeChecklistStatus).not.toEqual(RequestStatus.IN_PROGRESS);

            expect(
              screen.getByText(messages.bestPracticesChecklistDoneLoadingLabel.defaultMessage),
            ).toBeInTheDocument();
          });
        });
      });
    });
    describe('if enable_quality prop is false', () => {
      beforeEach(() => {
        setConfig({
          ...getConfig(),
          ENABLE_CHECKLIST_QUALITY: 'false',
        });
      });

      it('one checklist components ', () => {
        renderComponent();
        mockStore(200);

        expect(screen.getByText(messages.launchChecklistLabel.defaultMessage)).toBeVisible();

        expect(screen.queryByText(messages.bestPracticesChecklistLabel.defaultMessage)).toBeNull();
      });

      describe('an aria-live region with', () => {
        it('correct content when the launch checklist has loaded', async () => {
          renderComponent();
          mockStore(404);
          await waitFor(() => {
            const { launchChecklistStatus } = store.getState().courseChecklist.loadingStatus;

            expect(launchChecklistStatus).not.toEqual(RequestStatus.SUCCESSFUL);

            expect(screen.getByText(messages.launchChecklistDoneLoadingLabel.defaultMessage)).toBeInTheDocument();
          });
        });

        it('correct content when the best practices checklist is loading', async () => {
          renderComponent();
          mockStore(404);
          await waitFor(() => {
            const { bestPracticeChecklistStatus } = store.getState().courseChecklist.loadingStatus;

            expect(bestPracticeChecklistStatus).not.toEqual(RequestStatus.IN_PROGRESS);

            expect(screen.queryByText(messages.bestPracticesChecklistDoneLoadingLabel.defaultMessage)).toBeNull();
          });
        });
      });
    });

    it('displays an alert and sets status to DENIED when API responds with 403', async () => {
      const courseLaunchApiUrl = getCourseLaunchApiUrl({
        courseId, gradedOnly: true, validateOras: true, all: true,
      });
      axiosMock.onGet(courseLaunchApiUrl).reply(403);

      renderComponent();

      await waitFor(() => {
        const { launchChecklistStatus } = store.getState().courseChecklist.loadingStatus;
        expect(launchChecklistStatus).toEqual(RequestStatus.DENIED);
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
});

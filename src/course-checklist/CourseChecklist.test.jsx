import {
  render,
  waitFor,
  screen,
  initializeMocks,
} from '@src/testUtils';
import '@testing-library/jest-dom';
import { getConfig, setConfig } from '@edx/frontend-platform';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { RequestStatus } from '../data/constants';
import { executeThunk } from '../utils';
import { getCourseLaunchApiUrl, getCourseBestPracticesApiUrl } from './data/api';
import { fetchCourseLaunchQuery, fetchCourseBestPracticesQuery } from './data/thunks';
import {
  courseId,
  generateCourseLaunchData,
  generateCourseBestPracticesData,
} from './factories/mockApiResponses';
import messages from './messages';
import CourseChecklist from './index';

let axiosMock;
let store;

const renderComponent = () => {
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CourseChecklist />
    </CourseAuthoringProvider>,
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
    const mocks = initializeMocks();
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
  });
  describe('renders', () => {
    describe('if enable_quality prop is true', () => {
      it('two checklist components ', async () => {
        renderComponent();
        await mockStore(200);

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
          await mockStore(404);
          await waitFor(() => {
            const { launchChecklistStatus } = store.getState().courseChecklist.loadingStatus;

            expect(launchChecklistStatus).not.toEqual(RequestStatus.SUCCESSFUL);

            expect(screen.getByText(messages.launchChecklistDoneLoadingLabel.defaultMessage)).toBeInTheDocument();
          });
        });

        it('correct content when the best practices checklist is loading', async () => {
          renderComponent();
          await mockStore(404);
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

      it('one checklist components ', async () => {
        renderComponent();
        await mockStore(200);

        expect(screen.getByText(messages.launchChecklistLabel.defaultMessage)).toBeVisible();

        expect(screen.queryByText(messages.bestPracticesChecklistLabel.defaultMessage)).toBeNull();
      });

      describe('an aria-live region with', () => {
        it('correct content when the launch checklist has loaded', async () => {
          renderComponent();
          await mockStore(404);
          await waitFor(() => {
            const { launchChecklistStatus } = store.getState().courseChecklist.loadingStatus;

            expect(launchChecklistStatus).not.toEqual(RequestStatus.SUCCESSFUL);

            expect(screen.getByText(messages.launchChecklistDoneLoadingLabel.defaultMessage)).toBeInTheDocument();
          });
        });

        it('correct content when the best practices checklist is loading', async () => {
          renderComponent();
          await mockStore(404);
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

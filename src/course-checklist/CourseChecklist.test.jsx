import {
  render,
  screen,
  initializeMocks,
} from '@src/testUtils';
import '@testing-library/jest-dom';
import { getConfig, setConfig } from '@edx/frontend-platform';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { getCourseLaunchApiUrl, getCourseBestPracticesApiUrl } from './data/api';
import {
  courseId,
  generateCourseLaunchData,
  generateCourseBestPracticesData,
} from './factories/mockApiResponses';
import messages from './messages';
import CourseChecklist from './index';

let axiosMock;

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
};

describe('CourseChecklistPage', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
  });
  describe('renders', () => {
    describe('if enable_quality prop is true', () => {
      it('two checklist components ', async () => {
        await mockStore(200);
        renderComponent();

        expect(screen.getByText(messages.launchChecklistLabel.defaultMessage)).toBeVisible();

        expect(screen.getByText(messages.bestPracticesChecklistLabel.defaultMessage)).toBeVisible();
      });

      describe('an aria-live region with', () => {
        it('an aria-live region', async () => {
          renderComponent();
          const ariaLiveRegion = await screen.findByRole('status');

          expect(ariaLiveRegion).toBeDefined();

          expect(ariaLiveRegion.classList.contains('sr-only')).toBe(true);
        });

        it('correct content when the launch checklist has loaded', async () => {
          await mockStore(404);
          renderComponent();
          expect(await screen.findByText(messages.launchChecklistDoneLoadingLabel.defaultMessage)).toBeInTheDocument();
        });

        it('correct content when the best practices checklist is loading', async () => {
          await mockStore(404);
          renderComponent();
          expect(
            await screen.findByText(messages.bestPracticesChecklistDoneLoadingLabel.defaultMessage),
          ).toBeInTheDocument();
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
          await mockStore(404);
          renderComponent();
          expect(await screen.findByText(messages.launchChecklistDoneLoadingLabel.defaultMessage)).toBeInTheDocument();
        });

        it('correct content when the best practices checklist is loading', async () => {
          await mockStore(404);
          renderComponent();
          expect(screen.queryByText(messages.bestPracticesChecklistDoneLoadingLabel.defaultMessage)).toBeNull();
        });
      });
    });

    it('displays an alert and sets status to DENIED when API responds with 403', async () => {
      const courseLaunchApiUrl = getCourseLaunchApiUrl({
        courseId, gradedOnly: true, validateOras: true, all: true,
      });
      axiosMock.onGet(courseLaunchApiUrl).reply(403);

      renderComponent();

      expect(await screen.findByRole('alert')).toBeInTheDocument();
    });
  });
});

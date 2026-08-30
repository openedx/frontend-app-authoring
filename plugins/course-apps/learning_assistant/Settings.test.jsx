import { screen, waitFor } from '@testing-library/react';

import { CourseAuthoringProvider } from 'CourseAuthoring/CourseAuthoringContext';
import PagesAndResourcesProvider from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';
import { getCourseAppsApiUrl, getCourseDetailsUrl } from 'CourseAuthoring/data/api';
import { initializeMocks, render } from 'CourseAuthoring/testUtils';
import LearningAssistantSettings from './Settings';

const onClose = () => {};
const courseId = 'course-v1:edX+TestX+Test_Course';

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <PagesAndResourcesProvider courseId={courseId}>
        <LearningAssistantSettings onClose={onClose} />
      </PagesAndResourcesProvider>
    </CourseAuthoringProvider>,
  );

describe('Learning Assistant Settings', () => {
  it('renders', async () => {
    const { axiosMock } = initializeMocks();

    axiosMock.onGet(getCourseDetailsUrl(courseId, 'abc123')).reply(200, {
      courseId,
      name: 'Course Test',
      start: Date(),
    });

    axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(200, [
      {
        id: 'learning_assistant',
        name: 'Learning Assistant',
        description: 'Learning Assistant description',
        enabled: true,
        documentation_links: {
          learn_more_openai_data_privacy: 'www.example.com/learn-more-data-privacy',
          learn_more_openai: 'www.example.com/learn-more',
        },
        allowed_operations: {
          configure: false,
          enable: true,
        },
      },
    ]);

    renderComponent();

    const toggleDescription = 'Reinforce learning concepts by sharing text-based course content '
      + 'with OpenAI (via API) to power an in-course Learning Assistant. Learners can leave feedback about the quality '
      + 'of the AI-powered experience for use by edX to improve the performance of the tool.';

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Configure Learning Assistant' })).toBeInTheDocument()
    );
    await waitFor(() => expect(screen.getByText(toggleDescription)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Learn more about how OpenAI handles data')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Learn more about OpenAI API data privacy')).toBeInTheDocument());
  });
});

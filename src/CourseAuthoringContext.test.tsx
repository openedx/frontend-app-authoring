import { CourseAuthoringProvider, useCourseAuthoringContext } from './CourseAuthoringContext';
import { getApiWaffleFlagsUrl, getCourseAppsApiUrl } from './data/api';
import { initializeMocks, render, screen } from './testUtils';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

const CourseAppsList = () => {
  const { courseApps } = useCourseAuthoringContext();
  return (
    <ul>
      {courseApps.map(app => <li key={app.id}>{app.id}</li>)}
    </ul>
  );
};

describe('CourseAuthoringProvider', () => {
  it('sorts course apps according to COURSE_APPS_ORDER', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(getApiWaffleFlagsUrl(courseId)).reply(200, {});
    axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(200, [
      {
        id: 'wiki',
        name: 'Wiki',
        description: '',
        enabled: true,
        allowed_operations: { enable: true, configure: true },
      },
      {
        id: 'discussion',
        name: 'Discussion',
        description: '',
        enabled: true,
        allowed_operations: { enable: true, configure: true },
      },
    ]);

    render(
      <CourseAuthoringProvider courseId={courseId}>
        <CourseAppsList />
      </CourseAuthoringProvider>,
    );

    const items = await screen.findAllByRole('listitem');
    expect(items.map(item => item.textContent)).toEqual(['discussion', 'wiki']);
  });
});

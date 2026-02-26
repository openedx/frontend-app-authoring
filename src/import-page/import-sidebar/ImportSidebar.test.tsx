import { initializeMocks, render, screen } from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import messages from './messages';
import ImportSidebar from './ImportSidebar';

const courseId = 'course-123';

describe('<ImportSidebar />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render sidebar correctly', () => {
    render(
      <CourseAuthoringProvider courseId={courseId}>
        <ImportSidebar />
      </CourseAuthoringProvider>,
    );
    expect(screen.getByText(messages.title1.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.importedContentHeading.defaultMessage)).toBeInTheDocument();
  });
});

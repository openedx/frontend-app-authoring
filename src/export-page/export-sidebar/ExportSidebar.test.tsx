import { initializeMocks, render, screen } from '@src/testUtils';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import messages from './messages';
import ExportSidebar from './ExportSidebar';
import { CourseExportProvider } from '../CourseExportContext';

const courseId = 'course-123';

const renderComponent = () => render(
  <CourseAuthoringProvider courseId={courseId}>
    <CourseExportProvider>
      <ExportSidebar />
    </CourseExportProvider>
  </CourseAuthoringProvider>,
);

describe('<ExportSidebar />', () => {
  beforeEach(() => {
    initializeMocks();
  });
  it('render sidebar correctly', () => {
    renderComponent();
    expect(screen.getByText(messages.title1.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.exportedContentHeading.defaultMessage)).toBeInTheDocument();
  });
});

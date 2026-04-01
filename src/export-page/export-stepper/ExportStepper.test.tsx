import { render, initializeMocks, screen } from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';

import messages from './messages';
import ExportStepper from './ExportStepper';
import { CourseExportProvider } from '../CourseExportContext';

const courseId = 'course-123';

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <CourseExportProvider>
        <ExportStepper />
      </CourseExportProvider>
    </CourseAuthoringProvider>,
  );

describe('<ExportStepper />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render stepper correctly', () => {
    renderComponent();
    expect(screen.getByText(messages.stepperHeaderTitle.defaultMessage)).toBeInTheDocument();
  });
});

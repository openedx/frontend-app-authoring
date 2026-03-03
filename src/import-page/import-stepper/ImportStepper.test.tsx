import { render, initializeMocks, screen } from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import messages from './messages';
import ImportStepper from './ImportStepper';
import { CourseImportProvider } from '../CourseImportContext';

const renderComponent = () => render(
  <CourseAuthoringProvider courseId="123456">
    <CourseImportProvider>
      <ImportStepper />
    </CourseImportProvider>
  </CourseAuthoringProvider>,
);

describe('<ImportStepper />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render stepper correctly', () => {
    renderComponent();
    expect(screen.getByText(messages.stepperHeaderTitle.defaultMessage)).toBeInTheDocument();
  });
});

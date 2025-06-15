// @ts-check
import { initializeMocks, render } from '../../testUtils';
import messages from './messages';
import ExportSidebar from './ExportSidebar';

const courseId = 'course-123';

describe('<ExportSidebar />', () => {
  beforeEach(() => {
    initializeMocks();
  });
  it('render sidebar correctly', () => {
    const { getByText } = render(<ExportSidebar courseId={courseId} />);
    expect(getByText(messages.title1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.exportedContentHeading.defaultMessage)).toBeInTheDocument();
  });
});

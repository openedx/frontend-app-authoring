// @ts-check
import { initializeMocks, render } from '../../testUtils';
import messages from './messages';
import ImportSidebar from './ImportSidebar';

const courseId = 'course-123';

describe('<ImportSidebar />', () => {
  beforeEach(() => {
    initializeMocks();
  });
  it('render sidebar correctly', () => {
    const { getByText } = render(<ImportSidebar courseId={courseId} />);
    expect(getByText(messages.title1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.importedContentHeading.defaultMessage)).toBeInTheDocument();
  });
});

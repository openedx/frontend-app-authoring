// @ts-check
import { initializeMocks, render } from '../../testUtils';
import SettingsSidebar from './SettingsSidebar';
import messages from './messages';

const courseId = 'course-123';

describe('<SettingsSidebar />', () => {
  beforeEach(() => {
    initializeMocks();
  });
  it('renders about and other sidebar titles correctly', () => {
    const { getByText } = render(<SettingsSidebar courseId={courseId} />);
    expect(getByText(messages.about.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.other.defaultMessage)).toBeInTheDocument();
  });
  it('renders about descriptions correctly', () => {
    const { getByText } = render(<SettingsSidebar courseId={courseId} />);
    const aboutThirtyDescription = getByText('When you enter strings as policy values, ensure that you use double quotation marks (“) around the string. Do not use single quotation marks (‘).');
    expect(getByText(messages.aboutDescription1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.aboutDescription2.defaultMessage)).toBeInTheDocument();
    expect(aboutThirtyDescription).toBeInTheDocument();
  });
});

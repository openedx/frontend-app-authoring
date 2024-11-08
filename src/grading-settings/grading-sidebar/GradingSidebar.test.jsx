import { injectIntl } from '@edx/frontend-platform/i18n';
import {
  initializeMocks, render, screen,
} from '../../testUtils';
import messages from './messages';
import GradingSidebar from '.';

describe('<GradingSidebar />', () => {
  beforeEach(async () => {
    initializeMocks();
  });

  it('renders sidebar text content correctly', async () => {
    render(<GradingSidebar intl={injectIntl} courseId="123" />);
    expect(await screen.findByText(messages.gradingSidebarTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.gradingSidebarAbout1.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.gradingSidebarAbout2.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.gradingSidebarAbout3.defaultMessage)).toBeInTheDocument();
  });
});

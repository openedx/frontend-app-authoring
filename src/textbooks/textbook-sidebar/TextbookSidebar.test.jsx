// @ts-check
import { initializeMocks, render, waitFor } from '../../testUtils';
import { getHelpUrlsApiUrl } from '../../help-urls/data/api';
import { helpUrls } from '../../help-urls/__mocks__';
import TextbookSidebar from './TextbookSidebar';
import messages from './messages';

const courseId = 'course-v1:org+101+101';

const renderComponent = () => render(<TextbookSidebar courseId={courseId} />);

describe('<TextbookSidebar />', () => {
  beforeEach(async () => {
    const { axiosMock } = initializeMocks();
    axiosMock
      .onGet(getHelpUrlsApiUrl())
      .reply(200, helpUrls);
  });

  it('renders TextbookSidebar component correctly', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.section_1_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_1_descriptions.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_2_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_2_descriptions.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.sectionLink.defaultMessage)).toHaveAttribute('href', helpUrls.textbooks);
    });
  });
});

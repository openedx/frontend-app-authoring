import { initializeMocks, render, screen } from '@src/testUtils';
import { getHelpUrlsApiUrl } from '@src/help-urls/data/api';
import { helpUrls } from '@src/help-urls/__mocks__';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';

import TextbookSidebar from './TextbookSidebar';
import messages from './messages';

const courseId = 'course-v1:org+101+101';

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <TextbookSidebar />
    </CourseAuthoringProvider>,
  );

describe('<TextbookSidebar />', () => {
  beforeEach(async () => {
    const { axiosMock } = initializeMocks();
    axiosMock
      .onGet(getHelpUrlsApiUrl())
      .reply(200, helpUrls);
  });

  it('renders TextbookSidebar component correctly', async () => {
    renderComponent();

    expect(await screen.findByText(messages.section_1_title.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(messages.section_1_descriptions.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(messages.section_2_title.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(messages.section_2_descriptions.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(messages.sectionLink.defaultMessage)).toHaveAttribute('href', helpUrls.textbooks);
  });
});

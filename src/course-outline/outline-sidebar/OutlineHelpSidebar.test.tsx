import { initializeMocks, render, waitFor } from '@src/testUtils';
import { helpUrls } from '@src/help-urls/__mocks__';
import { getHelpUrlsApiUrl } from '@src/help-urls/data/api';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';

import OutlineHelpSidebar from './OutlineHelpSidebar';
import messages from './messages';

const courseId = '123';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const extraWrapper = ({ children }) => (
  <CourseAuthoringProvider courseId={courseId}>
    {children}
  </CourseAuthoringProvider>
);

let axiosMock;
const mockPathname = '/foo-bar';

const renderComponent = () => render(<OutlineHelpSidebar />, { path: mockPathname, extraWrapper });

describe('<OutlineSidebar />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getHelpUrlsApiUrl())
      .reply(200, helpUrls);
  });

  it('render OutlineSidebar component correctly', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.section_1_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_1_descriptions_1.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_1_descriptions_2.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_2_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_2_descriptions_1.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_2_link.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_3_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_3_descriptions_1.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_3_link.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_4_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_4_descriptions_1.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_4_descriptions_2.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_4_descriptions_3.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_4_link.defaultMessage)).toBeInTheDocument();
    });
  });
});

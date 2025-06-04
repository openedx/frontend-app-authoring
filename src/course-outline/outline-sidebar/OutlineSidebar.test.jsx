// @ts-check
import { initializeMocks, render, waitFor } from '../../testUtils';
import { helpUrls } from '../../help-urls/__mocks__';
import { getHelpUrlsApiUrl } from '../../help-urls/data/api';
import OutlineSidebar from './OutlineSidebar';
import messages from './messages';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

let axiosMock;
const mockPathname = '/foo-bar';
const courseId = '123';

const renderComponent = (props) => render(<OutlineSidebar courseId={courseId} {...props} />, { path: mockPathname });

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

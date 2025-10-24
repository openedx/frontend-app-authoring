import { getConfig } from '@edx/frontend-platform';

import {
  initializeMocks,
  screen,
  render,
  waitFor,
} from '../../testUtils';
import PageGrid from './PageGrid';
import { getApiWaffleFlagsUrl } from '../../data/api';

import PagesAndResourcesProvider from '../PagesAndResourcesProvider';

let axiosMock;
const courseId = '123';
const mockPageConfig = [
  {
    id: '1',
    legacyLink: `${getConfig().STUDIO_BASE_URL}/tabs/course-v1:OpenedX+DemoX+DemoCourse`,
    name: 'Custom pages',
  },
  {
    id: '2',
    legacyLink: `${getConfig().STUDIO_BASE_URL}/textbooks/course-v1:OpenedX+DemoX+DemoCourse`,
    name: 'Textbook',
    enabled: true,
  },
  {
    name: 'Page',
    allowedOperations: {
      enable: true,
    },
    id: '3',
  },
];

const renderComponent = () => {
  render(
    <PagesAndResourcesProvider courseId={courseId}>
      <PageGrid pages={mockPageConfig} />
    </PagesAndResourcesProvider>,
  );
};

describe('LiveSettings', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, {
        useNewGradingPage: true,
        useNewCertificatesPage: true,
        useNewScheduleDetailsPage: true,
        useNewCourseOutlinePage: true,
      });
  });

  it('should render three cards', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.queryAllByRole('button')).toHaveLength(3);
    });
  });

  it('should navigate to legacyLink', async () => {
    renderComponent();
    const textbookPagePath = mockPageConfig[0][1];
    await waitFor(() => {
      const textbookSettingsButton = screen.queryAllByRole('link')[1];
      expect(textbookSettingsButton).toHaveAttribute('href', textbookPagePath);
    });
  });
});

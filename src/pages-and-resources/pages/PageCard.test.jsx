import { getConfig } from '@edx/frontend-platform';

import {
  initializeMocks,
  screen,
  render,
  waitFor,
} from '../../testUtils';
import PageGrid from './PageGrid';
import { executeThunk } from '../../utils';
import { getApiWaffleFlagsUrl } from '../../data/api';
import { fetchWaffleFlags } from '../../data/thunks';

import PagesAndResourcesProvider from '../PagesAndResourcesProvider';

let container;
let store;
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
  const wrapper = render(
    <PagesAndResourcesProvider courseId={courseId}>
      <PageGrid pages={mockPageConfig} />
    </PagesAndResourcesProvider>,
  );
  container = wrapper.container;
};

describe('LiveSettings', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, {
        useNewGradingPage: true,
        useNewCertificatesPage: true,
        useNewScheduleDetailsPage: true,
        useNewCourseOutlinePage: true,
      });
    await executeThunk(fetchWaffleFlags(courseId), store.dispatch);
  });

  it('should render three cards', async () => {
    renderComponent();
    waitFor(() => {
      expect(screen.queryAllByRole(container, 'button')).toHaveLength(3);
    });
  });

  it('should navigate to legacyLink', async () => {
    renderComponent();
    const textbookPagePath = mockPageConfig[0][1];
    waitFor(() => {
      const textbookSettingsButton = screen.queryAllByRole(container, 'link')[1];
      expect(textbookSettingsButton).toHaveAttribute('href', textbookPagePath);
    });
  });
});

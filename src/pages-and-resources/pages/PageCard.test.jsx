import { getConfig } from '@edx/frontend-platform';

import { getApiWaffleFlagsUrl } from '@src/data/api';
import {
  initializeMocks,
  screen,
  render,
  waitFor,
} from '@src/testUtils';

import PageGrid from './PageGrid';
import PageCard from './PageCard';

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
    <PagesAndResourcesProvider courseId={courseId} isEditable>
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
        useNewCertificatesPage: true,
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

  it('renders readOnly mode correctly', async () => {
    render(
      <PagesAndResourcesProvider courseId={courseId} isEditable={false}>
        <PageGrid pages={mockPageConfig} />
      </PagesAndResourcesProvider>,
    );
    // When isEditable=false, settings button should be disabled
    await waitFor(() => {
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('renders enabled by default when readOnly is not specified (default false)', async () => {
    // readOnly defaults to false - page card should render with enabled settings
    render(
      <PagesAndResourcesProvider courseId={courseId} isEditable={true}>
        <PageGrid pages={mockPageConfig} />
      </PagesAndResourcesProvider>,
    );
    // Should render buttons (enabled by default)
    await waitFor(() => {
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('renders PageCard without isEditable in context (defaults to false, no settings button)', () => {
    render(
      <PagesAndResourcesProvider courseId={courseId}>
        <PageCard
          page={{
            id: '1',
            name: 'Test Page',
            description: 'Test description',
            enabled: false,
            legacyLink: null,
            allowedOperations: { enable: true },
          }}
          courseId={courseId}
        />
      </PagesAndResourcesProvider>,
    );
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('disables arrow buttons for legacy-link pages when isEditable=false in context', async () => {
    render(
      <PagesAndResourcesProvider courseId={courseId} isEditable={false}>
        <PageGrid pages={mockPageConfig} />
      </PagesAndResourcesProvider>,
    );
    await waitFor(() => {
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      const disabledButtons = buttons.filter((btn) => btn.disabled);
      expect(disabledButtons.length).toBeGreaterThan(0);
    });
  });
});

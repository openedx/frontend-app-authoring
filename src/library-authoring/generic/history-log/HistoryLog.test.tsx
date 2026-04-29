import { userEvent } from '@testing-library/user-event';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
  findByDeepTextContent,
} from '@src/testUtils';

import type { LibraryPublishContributor } from '@src/library-authoring/data/api';
import * as apiMocks from '@src/library-authoring/data/api.mocks';
import { HistoryComponentLog, HistoryContainerLog } from './HistoryLog';

apiMocks.mockLibraryBlockDraftHistory.applyMock();
apiMocks.mockLibraryBlockPublishHistory.applyMock();
apiMocks.mockLibraryBlockPublishHistoryEntries.applyMock();
apiMocks.mockLibraryBlockCreationEntry.applyMock();
apiMocks.mockLibraryBlockMetadata.applyMock();
apiMocks.mockLibraryContainerDraftHistory.applyMock();
apiMocks.mockLibraryContainerPublishHistory.applyMock();
apiMocks.mockLibraryContainerCreationEntry.applyMock();
apiMocks.mockGetContainerMetadata.applyMock();

const renderComponent = (componentId: string) =>
  render(
    <HistoryComponentLog componentId={componentId} />,
  );

const renderContainerComponent = (containerId: string) =>
  render(
    <HistoryContainerLog containerId={containerId} />,
  );

const mockContributorNoUsername = (): LibraryPublishContributor => ({
  profileImageUrls: {
    full: 'http://example.com/full.png',
    large: 'http://example.com/large.png',
    medium: 'http://example.com/medium.png',
    small: 'http://example.com/small.png',
  },
});

describe('<HistoryComponentLog />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('shows loading spinner while fetching', () => {
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKeyThatNeverLoads);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders draft history group with entries when they exist', async () => {
    const user = userEvent.setup();
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKey);
    const trigger = await findByDeepTextContent(/Introduction to Testing 1 is a draft/i);
    expect(trigger).toBeInTheDocument();
    await user.click(trigger);
    expect(await findByDeepTextContent(/test_user_1 edited.*Electron Arcs/i)).toBeInTheDocument();
    expect(await findByDeepTextContent(/test_user_2 renamed.*More on Quarks/i)).toBeInTheDocument();
  });

  it('does not render draft history group when there are no draft entries', async () => {
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKeyEmpty);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText(/is a draft/i)).not.toBeInTheDocument();
  });

  it('renders publish history group when one exists', async () => {
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKey);
    expect(await findByDeepTextContent(/author published.*Protons/i)).toBeInTheDocument();
    expect(await screen.findByText(/5 authors contributed/i)).toBeInTheDocument();
  });

  it('loads and shows publish history entries after expanding the publish group', async () => {
    const user = userEvent.setup();
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKey);
    expect(await screen.findByText(/5 authors contributed/i)).toBeInTheDocument();
    const publishTrigger = await findByDeepTextContent(/author published.*Protons/i);

    await user.click(publishTrigger);
    expect(await findByDeepTextContent(/test_user edited.*Protons/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/5 authors contributed/i)).not.toBeInTheDocument());
  });

  it('does not render publish history group when list is empty', async () => {
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKeyEmpty);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText(/published/i)).not.toBeInTheDocument();
  });

  it('always renders the created group with fallback user when createdBy is null', async () => {
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKey);
    expect(await findByDeepTextContent(/Author created.*Introduction to Testing 1/i)).toBeInTheDocument();
  });

  it('shows fallback "Author" for draft entry when contributor has no username', async () => {
    const user = userEvent.setup();
    const originalData = apiMocks.mockLibraryBlockDraftHistory.data;
    apiMocks.mockLibraryBlockDraftHistory.data = [
      {
        contributor: mockContributorNoUsername(),
        changedAt: '2026-03-16T11:00:00Z',
        title: 'Anonymous Component',
        itemType: 'html',
        action: 'edited',
      },
    ];
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKey);
    const trigger = await findByDeepTextContent(/Introduction to Testing 1 is a draft/i);
    await user.click(trigger);
    expect(await findByDeepTextContent(/Author edited.*Anonymous Component/i)).toBeInTheDocument();
    apiMocks.mockLibraryBlockDraftHistory.data = originalData;
  });

  it('shows fallback "Author" in publish group header when publishedBy is undefined', async () => {
    const originalData = apiMocks.mockLibraryBlockPublishHistory.data;
    apiMocks.mockLibraryBlockPublishHistory.data = [
      {
        ...originalData[0],
        publishedBy: undefined,
      },
    ];
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKey);
    expect(await findByDeepTextContent(/Author published.*Protons/i)).toBeInTheDocument();
    apiMocks.mockLibraryBlockPublishHistory.data = originalData;
  });

  it('renders draft entry with "created" action', async () => {
    const user = userEvent.setup();
    const originalData = apiMocks.mockLibraryBlockDraftHistory.data;
    apiMocks.mockLibraryBlockDraftHistory.data = [
      {
        contributor: {
          username: 'creator_user',
          profileImageUrls: {
            full: 'icon/mock/path',
            large: 'icon/mock/path',
            medium: 'icon/mock/path',
            small: 'icon/mock/path',
          },
        },
        changedAt: '2026-03-16T11:00:00Z',
        title: 'New Component',
        itemType: 'html',
        action: 'created',
      },
    ] as any;
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKey);
    const trigger = await findByDeepTextContent(/Introduction to Testing 1 is a draft/i);
    await user.click(trigger);
    expect(await findByDeepTextContent(/creator_user created.*New Component/i)).toBeInTheDocument();
    apiMocks.mockLibraryBlockDraftHistory.data = originalData;
  });

  it('renders publish group without collapsible and without contributor count when contributors is empty', async () => {
    const originalData = apiMocks.mockLibraryBlockPublishHistory.data;
    apiMocks.mockLibraryBlockPublishHistory.data = [
      {
        ...originalData[0],
        contributors: [],
      },
    ];
    renderComponent(apiMocks.mockLibraryBlockCreationEntry.usageKey);
    const publishTitle = await findByDeepTextContent(/author published.*Protons/i);
    expect(publishTitle).toBeInTheDocument();
    expect(screen.queryByText(/authors? contributed/i)).not.toBeInTheDocument();
    expect(publishTitle.closest('[role="button"]')).toBeNull();
    apiMocks.mockLibraryBlockPublishHistory.data = originalData;
  });
});

describe('<HistoryContainerLog />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('shows loading spinner while fetching', () => {
    renderContainerComponent(apiMocks.mockLibraryContainerDraftHistory.containerKeyThatNeverLoads);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders draft history group with entries when they exist', async () => {
    const user = userEvent.setup();
    renderContainerComponent(apiMocks.mockLibraryContainerDraftHistory.containerKey);
    const trigger = await findByDeepTextContent(/Test Unit is a draft/i);
    expect(trigger).toBeInTheDocument();
    await user.click(trigger);
    expect(await findByDeepTextContent(/container_user_1 edited.*Intro Unit/i)).toBeInTheDocument();
    expect(await findByDeepTextContent(/container_user_2 renamed.*Unit Renamed/i)).toBeInTheDocument();
  });

  it('does not render draft history group when there are no draft entries', async () => {
    renderContainerComponent(apiMocks.mockLibraryContainerDraftHistory.containerKeyEmpty);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText(/is a draft/i)).not.toBeInTheDocument();
  });

  it('renders publish history group when one exists', async () => {
    renderContainerComponent(apiMocks.mockLibraryContainerDraftHistory.containerKey);
    expect(await findByDeepTextContent(/container_author published.*Intro Unit/i)).toBeInTheDocument();
    expect(await screen.findByText(/2 authors contributed/i)).toBeInTheDocument();
  });

  it('does not render publish history group when list is empty', async () => {
    renderContainerComponent(apiMocks.mockLibraryContainerDraftHistory.containerKeyEmpty);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText(/published/i)).not.toBeInTheDocument();
  });

  it('renders draft entry with "created" action', async () => {
    const user = userEvent.setup();
    const originalData = apiMocks.mockLibraryContainerDraftHistory.data;
    apiMocks.mockLibraryContainerDraftHistory.data = [
      {
        contributor: {
          username: 'creator_user',
          profileImageUrls: {
            full: 'icon/mock/path',
            large: 'icon/mock/path',
            medium: 'icon/mock/path',
            small: 'icon/mock/path',
          },
        },
        changedAt: '2026-03-16T11:00:00Z',
        title: 'New Unit',
        itemType: 'unit',
        action: 'created',
      },
    ] as any;
    renderContainerComponent(apiMocks.mockLibraryContainerDraftHistory.containerKey);
    const trigger = await findByDeepTextContent(/Test Unit is a draft/i);
    await user.click(trigger);
    expect(await findByDeepTextContent(/creator_user created.*New Unit/i)).toBeInTheDocument();
    apiMocks.mockLibraryContainerDraftHistory.data = originalData;
  });

  it('always renders the created group', async () => {
    renderContainerComponent(apiMocks.mockLibraryContainerDraftHistory.containerKey);
    expect(await findByDeepTextContent(/author created.*Introduction to Testing Unit 1/i)).toBeInTheDocument();
  });

  it('renders publish groups after container creation before the created entry', async () => {
    // Default mock: publishedAt '2026-03-14' is after createdAt '2024-01-01'
    renderContainerComponent(apiMocks.mockLibraryContainerDraftHistory.containerKey);
    const publishGroup = await findByDeepTextContent(/container_author published.*Intro Unit/i);
    const createdEntry = await findByDeepTextContent(/author created.*Introduction to Testing Unit 1/i);
    expect(publishGroup.compareDocumentPosition(createdEntry)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('renders publish groups before container creation after the created entry', async () => {
    const originalData = apiMocks.mockLibraryContainerPublishHistory.data;
    apiMocks.mockLibraryContainerPublishHistory.data = [
      {
        ...originalData[0],
        publishedAt: '2023-01-01T00:00:00Z', // before createdAt '2024-01-01'
      },
    ];
    renderContainerComponent(apiMocks.mockLibraryContainerDraftHistory.containerKey);
    const createdEntry = await findByDeepTextContent(/author created.*Introduction to Testing Unit 1/i);
    expect(await screen.findByText(/2 authors contributed/i)).toBeInTheDocument();
    // The publish group contributors should still appear
    const contributorsText = screen.getByText(/2 authors contributed/i);
    expect(createdEntry.compareDocumentPosition(contributorsText)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    apiMocks.mockLibraryContainerPublishHistory.data = originalData;
  });

  it('renders both pre-creation and post-creation publish groups in correct order', async () => {
    const originalData = apiMocks.mockLibraryContainerPublishHistory.data;
    apiMocks.mockLibraryContainerPublishHistory.data = [
      {
        ...originalData[0],
        publishLogUuid: 'after-uuid',
        publishedAt: '2026-01-01T00:00:00Z', // after createdAt '2024-01-01'
        directPublishedEntities: [
          { ...originalData[0].directPublishedEntities[0], entityKey: 'key-after', title: 'After Unit' },
        ],
        contributors: [],
      },
      {
        ...originalData[0],
        publishLogUuid: 'before-uuid',
        publishedAt: '2023-01-01T00:00:00Z', // before createdAt '2024-01-01'
        directPublishedEntities: [
          { ...originalData[0].directPublishedEntities[0], entityKey: 'key-before', title: 'Before Unit' },
        ],
        contributors: [],
      },
    ];
    renderContainerComponent(apiMocks.mockLibraryContainerDraftHistory.containerKey);
    const afterGroup = await findByDeepTextContent(/container_author published.*After Unit/i);
    const createdEntry = await findByDeepTextContent(/author created.*Introduction to Testing Unit 1/i);
    // After-creation group comes before the created entry
    expect(afterGroup.compareDocumentPosition(createdEntry)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    // Before-creation group title is hidden (hideLogVert=true, no contributors), so only the vert line renders
    // Verify the after-group is visible but before-group title is not
    expect(screen.queryByText(/container_author published.*Before Unit/i)).not.toBeInTheDocument();
    apiMocks.mockLibraryContainerPublishHistory.data = originalData;
  });
});

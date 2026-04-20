import { userEvent } from '@testing-library/user-event';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
  findByDeepTextContent,
} from '@src/testUtils';

import {
  mockLibraryBlockDraftHistory,
  mockLibraryBlockPublishHistory,
  mockLibraryBlockPublishHistoryEntries,
  mockLibraryBlockCreationEntry,
  mockLibraryBlockMetadata,
  mockLibraryContainerDraftHistory,
  mockLibraryContainerPublishHistory,
  mockLibraryContainerCreationEntry,
  mockGetContainerMetadata,
} from '@src/library-authoring/data/api.mocks';
import { HistoryComponentLog, HistoryContainerLog } from './HistoryLog';

mockLibraryBlockDraftHistory.applyMock();
mockLibraryBlockPublishHistory.applyMock();
mockLibraryBlockPublishHistoryEntries.applyMock();
mockLibraryBlockCreationEntry.applyMock();
mockLibraryBlockMetadata.applyMock();
mockLibraryContainerDraftHistory.applyMock();
mockLibraryContainerPublishHistory.applyMock();
mockLibraryContainerCreationEntry.applyMock();
mockGetContainerMetadata.applyMock();

const renderComponent = (componentId: string) =>
  render(
    <HistoryComponentLog componentId={componentId} />,
  );

const renderContainerComponent = (containerId: string) =>
  render(
    <HistoryContainerLog containerId={containerId} />,
  );

describe('<HistoryComponentLog />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('shows loading spinner while fetching', () => {
    renderComponent(mockLibraryBlockCreationEntry.usageKeyThatNeverLoads);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders draft history group with entries when they exist', async () => {
    const user = userEvent.setup();
    renderComponent(mockLibraryBlockCreationEntry.usageKey);
    const trigger = await findByDeepTextContent(/Introduction to Testing 1 is a draft/i);
    expect(trigger).toBeInTheDocument();
    await user.click(trigger);
    expect(await findByDeepTextContent(/test_user_1 edited.*Electron Arcs/i)).toBeInTheDocument();
    expect(await findByDeepTextContent(/test_user_2 renamed.*More on Quarks/i)).toBeInTheDocument();
  });

  it('does not render draft history group when there are no draft entries', async () => {
    renderComponent(mockLibraryBlockCreationEntry.usageKeyEmpty);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText(/is a draft/i)).not.toBeInTheDocument();
  });

  it('renders publish history group when one exists', async () => {
    renderComponent(mockLibraryBlockCreationEntry.usageKey);
    expect(await findByDeepTextContent(/author published.*Protons/i)).toBeInTheDocument();
    expect(await screen.findByText(/5 authors contributed/i)).toBeInTheDocument();
  });

  it('loads and shows publish history entries after expanding the publish group', async () => {
    const user = userEvent.setup();
    renderComponent(mockLibraryBlockCreationEntry.usageKey);
    expect(await screen.findByText(/5 authors contributed/i)).toBeInTheDocument();
    const publishTrigger = await findByDeepTextContent(/author published.*Protons/i);

    await user.click(publishTrigger);
    expect(await findByDeepTextContent(/test_user edited.*Protons/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/5 authors contributed/i)).not.toBeInTheDocument());
  });

  it('does not render publish history group when list is empty', async () => {
    renderComponent(mockLibraryBlockCreationEntry.usageKeyEmpty);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText(/published/i)).not.toBeInTheDocument();
  });

  it('always renders the created group with fallback user when createdBy is null', async () => {
    renderComponent(mockLibraryBlockCreationEntry.usageKey);
    expect(await findByDeepTextContent(/Author created.*Introduction to Testing 1/i)).toBeInTheDocument();
  });
});

describe('<HistoryContainerLog />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('shows loading spinner while fetching', () => {
    renderContainerComponent(mockLibraryContainerDraftHistory.containerKeyThatNeverLoads);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders draft history group with entries when they exist', async () => {
    const user = userEvent.setup();
    renderContainerComponent(mockLibraryContainerDraftHistory.containerKey);
    const trigger = await findByDeepTextContent(/Test Unit is a draft/i);
    expect(trigger).toBeInTheDocument();
    await user.click(trigger);
    expect(await findByDeepTextContent(/container_user_1 edited.*Intro Unit/i)).toBeInTheDocument();
    expect(await findByDeepTextContent(/container_user_2 renamed.*Unit Renamed/i)).toBeInTheDocument();
  });

  it('does not render draft history group when there are no draft entries', async () => {
    renderContainerComponent(mockLibraryContainerDraftHistory.containerKeyEmpty);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText(/is a draft/i)).not.toBeInTheDocument();
  });

  it('renders publish history group when one exists', async () => {
    renderContainerComponent(mockLibraryContainerDraftHistory.containerKey);
    expect(await findByDeepTextContent(/container_author published.*Intro Unit/i)).toBeInTheDocument();
    expect(await screen.findByText(/2 authors contributed/i)).toBeInTheDocument();
  });

  it('does not render publish history group when list is empty', async () => {
    renderContainerComponent(mockLibraryContainerDraftHistory.containerKeyEmpty);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText(/published/i)).not.toBeInTheDocument();
  });

  it('always renders the created group', async () => {
    renderContainerComponent(mockLibraryContainerDraftHistory.containerKey);
    expect(await findByDeepTextContent(/author created.*Introduction to Testing Unit 1/i)).toBeInTheDocument();
  });
});

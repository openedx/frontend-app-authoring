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
} from '@src/library-authoring/data/api.mocks';
import { HistoryComponentLog } from './HistoryLog';

mockLibraryBlockDraftHistory.applyMock();
mockLibraryBlockPublishHistory.applyMock();
mockLibraryBlockPublishHistoryEntries.applyMock();
mockLibraryBlockCreationEntry.applyMock();

const renderComponent = (componentId: string) => render(
  <HistoryComponentLog componentId={componentId} displayName="Test Component" />,
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
    const trigger = await findByDeepTextContent(/Test Component is a draft/i);
    expect(trigger).toBeInTheDocument();
    await user.click(trigger);
    expect(await findByDeepTextContent(/test_user_1 edited.*Electron Arcs/i)).toBeInTheDocument();
    expect(await findByDeepTextContent(/test_user_2 renamed.*More on Quarks/i)).toBeInTheDocument();
  });

  it('does not render draft history group when there are no draft entries', async () => {
    renderComponent(mockLibraryBlockCreationEntry.usageKeyEmpty);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText('Test Component is a draft')).not.toBeInTheDocument();
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
import {
  initializeMocks,
  render,
  screen,
  waitFor,
  fireEvent,
} from '@src/testUtils';

import {
  mockLibraryBlockDraftHistory,
  mockLibraryBlockPublishHistory,
  mockLibraryBlockPublishHistoryEntries,
  mockLibraryBlockMetadata,
} from '../../data/api.mocks';
import { HistoryComponentLog } from './HistoryLog';

mockLibraryBlockDraftHistory.applyMock();
mockLibraryBlockPublishHistory.applyMock();
mockLibraryBlockPublishHistoryEntries.applyMock();
mockLibraryBlockMetadata.applyMock();

const renderComponent = (componentId: string) => render(
  <HistoryComponentLog componentId={componentId} displayName="Test Component" />,
);

describe('<HistoryComponentLog />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('shows loading spinner while fetching', () => {
    renderComponent(mockLibraryBlockMetadata.usageKeyThatNeverLoads);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders draft history group with entries when they exist', async () => {
    renderComponent(mockLibraryBlockMetadata.usageKeyNeverPublished);
    const trigger = await screen.findByText('Test Component is a draft');
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(await screen.findByText(/test_user_1 edited this component/i)).toBeInTheDocument();
    expect(await screen.findByText(/test_user_2 renamed this component/i)).toBeInTheDocument();
  });

  it('does not render draft history group when there are no draft entries', async () => {
    renderComponent(mockLibraryBlockMetadata.usageKeyPublished);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText('Test Component is a draft')).not.toBeInTheDocument();
  });

  it('renders publish history group when one exists', async () => {
    renderComponent(mockLibraryBlockMetadata.usageKeyNeverPublished);
    expect(await screen.findByText(/author published this component/i)).toBeInTheDocument();
    expect(await screen.findByText(/5 authors contributed/i)).toBeInTheDocument();
  });

  it('loads and shows publish history entries after expanding the publish group', async () => {
    renderComponent(mockLibraryBlockMetadata.usageKeyNeverPublished);
    expect(await screen.findByText(/5 authors contributed/i)).toBeInTheDocument();
    const publishTrigger = await screen.findByText(/author published this component/i);
    
    fireEvent.click(publishTrigger);
    expect(await screen.findByText(/test_user edited this component/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/5 authors contributed/i)).not.toBeInTheDocument());
  });

  it('does not render publish history group when list is empty', async () => {
    renderComponent(mockLibraryBlockMetadata.usageKeyPublished);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByText(/published this component/i)).not.toBeInTheDocument();
  });

  it('always renders the created group with fallback user when createdBy is null', async () => {
    renderComponent(mockLibraryBlockMetadata.usageKeyNeverPublished);
    expect(await screen.findByText(/Author created this component/i)).toBeInTheDocument();
  });
});

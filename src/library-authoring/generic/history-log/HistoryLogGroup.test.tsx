import { userEvent } from '@testing-library/user-event';
import {
  initializeMocks,
  render,
  screen,
  findByDeepTextContent,
} from '@src/testUtils';

import {
  mockLibraryBlockDraftHistory,
  mockLibraryBlockPublishHistory,
  mockLibraryBlockPublishHistoryEntries,
  mockLibraryContainerDraftHistory,
} from '@src/library-authoring/data/api.mocks';
import { HistoryDraftLogGroup, HistoryPublishLogGroup } from './HistoryLogGroup';

mockLibraryBlockDraftHistory.applyMock();
mockLibraryBlockPublishHistory.applyMock();
mockLibraryBlockPublishHistoryEntries.applyMock();

const draftEntries = mockLibraryBlockDraftHistory.data;
const publishGroup = mockLibraryBlockPublishHistory.data[0];
const containerDraftEntries = mockLibraryContainerDraftHistory.data;

describe('<HistoryLogGroup />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('opens the compare modal from a draft entry action menu', async () => {
    const user = userEvent.setup();

    render(
      <HistoryDraftLogGroup
        itemId={mockLibraryBlockDraftHistory.usageKey}
        displayName="Test Component"
        entries={draftEntries}
      />,
    );

    const trigger = await findByDeepTextContent(/Test Component is a draft/i);
    await user.click(trigger);

    const firstEntry = await findByDeepTextContent(/test_user_1 edited.*Electron Arcs/i);
    expect(firstEntry).toBeInTheDocument();

    await user.click(await screen.findAllByRole('button', { name: /more actions/i }).then(buttons => buttons[0]));
    await user.click(await screen.findByText('Show this version'));

    expect(await screen.findByText('Preview changes: Electron Arcs')).toBeInTheDocument();
  });

  it('shows publish history entries and opens the compare modal after expanding', async () => {
    const user = userEvent.setup();

    render(
      <HistoryPublishLogGroup
        {...publishGroup}
        itemId={mockLibraryBlockPublishHistory.usageKeyWithGroups}
      />,
    );

    const publishTrigger = await findByDeepTextContent(/author published.*Protons/i);
    await user.click(publishTrigger);

    expect(await findByDeepTextContent(/test_user edited.*Protons/i)).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: /more actions/i }));
    await user.click(await screen.findByText('Show this version'));

    expect(await screen.findByText('Preview changes: Protons')).toBeInTheDocument();
  });

  it('hides entry action dropdown for container item ids', async () => {
    const user = userEvent.setup();

    render(
      <HistoryDraftLogGroup
        itemId={mockLibraryContainerDraftHistory.containerKey}
        displayName="Intro Unit"
        entries={containerDraftEntries}
      />,
    );

    const trigger = await findByDeepTextContent(/Intro Unit is a draft/i);
    await user.click(trigger);

    expect(await findByDeepTextContent(/container_user_1 edited.*Intro Unit/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /more actions/i })).not.toBeInTheDocument();
  });
});

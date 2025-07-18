import {
  act, fireEvent, initializeMocks, render, screen, waitFor, within,
} from '@src/testUtils';

import { XBlock } from '@src/data/types';
import UnitCard from './UnitCard';
import cardMessages from '../card-header/messages';

const mockUseAcceptLibraryBlockChanges = jest.fn();
const mockUseIgnoreLibraryBlockChanges = jest.fn();

jest.mock('@src/course-unit/data/apiHooks', () => ({
  useAcceptLibraryBlockChanges: () => ({
    mutateAsync: mockUseAcceptLibraryBlockChanges,
  }),
  useIgnoreLibraryBlockChanges: () => ({
    mutateAsync: mockUseIgnoreLibraryBlockChanges,
  }),
}));

const section = {
  id: '1',
  displayName: 'Section Name',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  highlights: ['highlight 1', 'highlight 2'],
} as XBlock;

const subsection = {
  id: '12',
  displayName: 'Subsection Name',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
} as XBlock;

const unit = {
  id: '123',
  displayName: 'unit Name',
  category: 'vertical',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  actions: {
    draggable: true,
    childAddable: true,
    deletable: true,
    duplicable: true,
  },
  isHeaderVisible: true,
  upstreamInfo: {
    readyToSync: true,
    upstreamRef: 'lct:org1:lib1:unit:1',
    versionSynced: 1,
  },
} as XBlock;

const renderComponent = (props?: object) => render(
  <UnitCard
    section={section}
    subsection={subsection}
    unit={unit}
    index={1}
    getPossibleMoves={jest.fn()}
    onOrderChange={jest.fn()}
    onOpenPublishModal={jest.fn()}
    onOpenDeleteModal={jest.fn()}
    onOpenConfigureModal={jest.fn()}
    savingStatus=""
    onEditSubmit={jest.fn()}
    onDuplicateSubmit={jest.fn()}
    getTitleLink={(id) => `/some/${id}`}
    isSelfPaced={false}
    isCustomRelativeDatesActive={false}
    discussionsSettings={{
      providerType: '',
      enableGradedUnits: false,
    }}
    {...props}
  />,
);

describe('<UnitCard />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render UnitCard component correctly', async () => {
    const { findByTestId } = renderComponent();

    expect(await findByTestId('unit-card-header')).toBeInTheDocument();
    expect(await findByTestId('unit-card-header__title-link')).toHaveAttribute('href', '/some/123');
  });

  it('hides header based on isHeaderVisible flag', async () => {
    const { queryByTestId } = renderComponent({
      unit: {
        ...unit,
        isHeaderVisible: false,
      },
    });
    expect(queryByTestId('unit-card-header')).not.toBeInTheDocument();
  });

  it('hides duplicate & delete option based on duplicable & deletable action flag', async () => {
    const { findByTestId } = renderComponent({
      unit: {
        ...unit,
        actions: {
          draggable: true,
          childAddable: false,
          deletable: false,
          duplicable: false,
        },
      },
    });
    const element = await findByTestId('unit-card');
    const menu = await within(element).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));
    expect(within(element).queryByTestId('unit-card-header__menu-duplicate-button')).not.toBeInTheDocument();
    expect(within(element).queryByTestId('unit-card-header__menu-delete-button')).not.toBeInTheDocument();
  });

  it('shows copy option based on enableCopyPasteUnits flag', async () => {
    const { findByTestId } = renderComponent({
      unit: {
        ...unit,
        enableCopyPasteUnits: true,
      },
    });
    const element = await findByTestId('unit-card');
    const menu = await within(element).findByTestId('unit-card-header__menu-button');
    await act(async () => fireEvent.click(menu));
    expect(within(element).queryByText(cardMessages.menuCopy.defaultMessage)).toBeInTheDocument();
  });

  it('hides status badge for unscheduled units', async () => {
    const { queryByRole } = renderComponent({
      unit: {
        ...unit,
        visibilityState: 'unscheduled',
        hasChanges: false,
      },
    });
    expect(queryByRole('status')).not.toBeInTheDocument();
  });

  it('should sync unit changes from upstream', async () => {
    renderComponent();

    expect(await screen.findByTestId('unit-card-header')).toBeInTheDocument();

    // Click on sync button
    const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
    fireEvent.click(syncButton);

    // Should open compare preview modal
    expect(screen.getByRole('heading', { name: /preview changes: unit name/i })).toBeInTheDocument();
    expect(screen.getByText('Preview not available')).toBeInTheDocument();

    // Click on accept changes
    const acceptChangesButton = screen.getByText(/accept changes/i);
    fireEvent.click(acceptChangesButton);

    await waitFor(() => expect(mockUseAcceptLibraryBlockChanges).toHaveBeenCalled());
  });

  it('should decline sync unit changes from upstream', async () => {
    renderComponent();

    expect(await screen.findByTestId('unit-card-header')).toBeInTheDocument();

    // Click on sync button
    const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
    fireEvent.click(syncButton);

    // Should open compare preview modal
    expect(screen.getByRole('heading', { name: /preview changes: unit name/i })).toBeInTheDocument();
    expect(screen.getByText('Preview not available')).toBeInTheDocument();

    // Click on ignore changes
    const ignoreChangesButton = screen.getByRole('button', { name: /ignore changes/i });
    fireEvent.click(ignoreChangesButton);

    // Should open the confirmation modal
    expect(screen.getByRole('heading', { name: /ignore these changes\?/i })).toBeInTheDocument();

    // Click on ignore button
    const ignoreButton = screen.getByRole('button', { name: /ignore/i });
    fireEvent.click(ignoreButton);

    await waitFor(() => expect(mockUseIgnoreLibraryBlockChanges).toHaveBeenCalled());
  });
});

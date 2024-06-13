import { MemoryRouter } from 'react-router-dom';
import {
  act, render, fireEvent, within,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import initializeStore from '../../store';
import SubsectionCard from './SubsectionCard';
import cardHeaderMessages from '../card-header/messages';

let store;
const mockPathname = '/foo-bar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const clipboardBroadcastChannelMock = {
  postMessage: jest.fn(),
  close: jest.fn(),
};

global.BroadcastChannel = jest.fn(() => clipboardBroadcastChannelMock);

const unit = {
  id: 'unit-1',
};

const subsection = {
  id: '123',
  displayName: 'Subsection Name',
  category: 'sequential',
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
  releasedToStudents: true,
  childInfo: {
    children: [{
      id: unit.id,
    }],
  },
};

const section = {
  id: '123',
  displayName: 'Section Name',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  highlights: ['highlight 1', 'highlight 2'],
  childInfo: {
    children: [{
      id: subsection.id,
    }],
  },
};

const onEditSubectionSubmit = jest.fn();
const queryClient = new QueryClient();

const renderComponent = (props, entry = '/') => render(
  <AppProvider store={store} wrapWithRouter={false}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        <IntlProvider locale="en">
          <SubsectionCard
            section={section}
            subsection={subsection}
            index={1}
            isSelfPaced={false}
            getPossibleMoves={jest.fn()}
            onOrderChange={jest.fn()}
            onOpenPublishModal={jest.fn()}
            onOpenHighlightsModal={jest.fn()}
            onOpenDeleteModal={jest.fn()}
            onNewUnitSubmit={jest.fn()}
            isCustomRelativeDatesActive={false}
            onEditClick={jest.fn()}
            savingStatus=""
            onEditSubmit={onEditSubectionSubmit}
            onDuplicateSubmit={jest.fn()}
            namePrefix="subsection"
            onOpenConfigureModal={jest.fn()}
            onPasteClick={jest.fn()}
            {...props}
          >
            <span>children</span>
          </SubsectionCard>
        </IntlProvider>
      </MemoryRouter>
    </QueryClientProvider>
  </AppProvider>,
);

describe('<SubsectionCard />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
  });

  it('render SubsectionCard component correctly', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('subsection-card-header')).toBeInTheDocument();
  });

  it('expands/collapses the card when the subsection button is clicked', async () => {
    const { queryByTestId, findByTestId } = renderComponent();

    const expandButton = await findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(queryByTestId('subsection-card__units')).toBeInTheDocument();
    expect(queryByTestId('new-unit-button')).toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(queryByTestId('subsection-card__units')).not.toBeInTheDocument();
    expect(queryByTestId('new-unit-button')).not.toBeInTheDocument();
  });

  it('updates current section, subsection and item', async () => {
    const { findByTestId } = renderComponent();

    const menu = await findByTestId('subsection-card-header__menu');
    fireEvent.click(menu);
    const { currentSection, currentSubsection, currentItem } = store.getState().courseOutline;
    expect(currentSection).toEqual(section);
    expect(currentSubsection).toEqual(subsection);
    expect(currentItem).toEqual(subsection);
  });

  it('title only updates if changed', async () => {
    const { findByTestId } = renderComponent();

    let editButton = await findByTestId('subsection-edit-button');
    fireEvent.click(editButton);
    let editField = await findByTestId('subsection-edit-field');
    fireEvent.blur(editField);

    expect(onEditSubectionSubmit).not.toHaveBeenCalled();

    editButton = await findByTestId('subsection-edit-button');
    fireEvent.click(editButton);
    editField = await findByTestId('subsection-edit-field');
    fireEvent.change(editField, { target: { value: 'some random value' } });
    fireEvent.keyDown(editField, { key: 'Enter', keyCode: 13 });
    expect(onEditSubectionSubmit).toHaveBeenCalled();
  });

  it('hides header based on isHeaderVisible flag', async () => {
    const { queryByTestId } = renderComponent({
      subsection: {
        ...subsection,
        isHeaderVisible: false,
      },
    });
    expect(queryByTestId('subsection-card-header')).not.toBeInTheDocument();
  });

  it('hides add new, duplicate & delete option based on childAddable, duplicable & deletable action flag', async () => {
    const { findByTestId, queryByTestId } = renderComponent({
      subsection: {
        ...subsection,
        actions: {
          draggable: true,
          childAddable: false,
          deletable: false,
          duplicable: false,
        },
      },
    });
    const element = await findByTestId('subsection-card');
    const menu = await within(element).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));
    expect(within(element).queryByTestId('subsection-card-header__menu-duplicate-button')).not.toBeInTheDocument();
    expect(within(element).queryByTestId('subsection-card-header__menu-delete-button')).not.toBeInTheDocument();
    expect(queryByTestId('new-unit-button')).not.toBeInTheDocument();
  });

  it('renders live status', async () => {
    const { findByText } = renderComponent();
    expect(await findByText(cardHeaderMessages.statusBadgeLive.defaultMessage)).toBeInTheDocument();
  });

  it('renders published but live status', async () => {
    const { findByText } = renderComponent({
      subsection: {
        ...subsection,
        published: true,
        visibilityState: 'ready',
      },
    });
    expect(await findByText(cardHeaderMessages.statusBadgePublishedNotLive.defaultMessage)).toBeInTheDocument();
  });

  it('renders staff status', async () => {
    const { findByText } = renderComponent({
      subsection: {
        ...subsection,
        published: false,
        visibilityState: 'staff_only',
      },
    });
    expect(await findByText(cardHeaderMessages.statusBadgeStaffOnly.defaultMessage)).toBeInTheDocument();
  });

  it('renders draft status', async () => {
    const { findByText } = renderComponent({
      subsection: {
        ...subsection,
        published: false,
        visibilityState: 'needs_attention',
        hasChanges: true,
      },
    });
    expect(await findByText(cardHeaderMessages.statusBadgeDraft.defaultMessage)).toBeInTheDocument();
  });

  it('check extended subsection when URL "show" param in subsection', async () => {
    const { findByTestId } = renderComponent(null, `?show=${unit.id}`);

    const cardUnits = await findByTestId('subsection-card__units');
    const newUnitButton = await findByTestId('new-unit-button');
    expect(cardUnits).toBeInTheDocument();
    expect(newUnitButton).toBeInTheDocument();
  });

  it('check not extended subsection when URL "show" param not in subsection', async () => {
    const randomId = 'random-id';
    const { queryByTestId } = renderComponent(null, `?show=${randomId}`);

    const cardUnits = await queryByTestId('subsection-card__units');
    const newUnitButton = await queryByTestId('new-unit-button');
    expect(cardUnits).toBeNull();
    expect(newUnitButton).toBeNull();
  });
});

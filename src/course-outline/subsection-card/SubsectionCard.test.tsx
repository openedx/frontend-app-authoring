import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import {
  act, fireEvent, initializeMocks, render, screen, within,
} from '@src/testUtils';
import { XBlock } from '@src/data/types';
import cardHeaderMessages from '../card-header/messages';
import SubsectionCard from './SubsectionCard';

let store;
const mockPathname = '/foo-bar';
const containerKey = 'lct:org:lib:unit:1';
const handleOnAddUnitFromLibrary = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: () => ({
    librariesV2Enabled: true,
  }),
}));

// Mock ComponentPicker to call onComponentSelected on click
jest.mock('@src/library-authoring/component-picker', () => ({
  ComponentPicker: (props) => {
    const onClick = () => {
      // eslint-disable-next-line react/prop-types
      props.onComponentSelected({
        usageKey: containerKey,
        blockType: 'unti',
      });
    };
    return (
      <button type="submit" onClick={onClick}>
        Dummy button
      </button>
    );
  },
}));

const unit = {
  id: 'unit-1',
};

const subsection: XBlock = {
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
  upstreamInfo: {
    readyToSync: true,
    upstreamRef: 'lct:org1:lib1:subsection:1',
    versionSynced: 1,
  },
} as XBlock;

const section: XBlock = {
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
} as XBlock;

const onEditSubectionSubmit = jest.fn();

const renderComponent = (props?: object, entry = '/') => render(
  <SubsectionCard
    section={section}
    subsection={subsection}
    index={1}
    isSelfPaced={false}
    getPossibleMoves={jest.fn()}
    onOrderChange={jest.fn()}
    onOpenPublishModal={jest.fn()}
    onOpenDeleteModal={jest.fn()}
    onNewUnitSubmit={jest.fn()}
    onAddUnitFromLibrary={handleOnAddUnitFromLibrary}
    isCustomRelativeDatesActive={false}
    savingStatus=""
    onEditSubmit={onEditSubectionSubmit}
    onDuplicateSubmit={jest.fn()}
    onOpenConfigureModal={jest.fn()}
    onPasteClick={jest.fn()}
    resetScrollState={jest.fn()}
    isSectionsExpanded={false}
    {...props}
  >
    <span>children</span>
  </SubsectionCard>,
  {
    path: '/',
    routerProps: {
      initialEntries: [entry],
    },
  },
);

describe('<SubsectionCard />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    store = mocks.reduxStore;
  });

  it('render SubsectionCard component correctly', () => {
    renderComponent();

    expect(screen.getByTestId('subsection-card-header')).toBeInTheDocument();
  });

  it('expands/collapses the card when the subsection button is clicked', async () => {
    renderComponent();

    const expandButton = await screen.findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(screen.queryByTestId('subsection-card__units')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New unit' })).toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(screen.queryByTestId('subsection-card__units')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New unit' })).not.toBeInTheDocument();
  });

  it('updates current section, subsection and item', async () => {
    renderComponent();

    const menu = await screen.findByTestId('subsection-card-header__menu');
    fireEvent.click(menu);
    const { currentSection, currentSubsection, currentItem } = store.getState().courseOutline;
    expect(currentSection).toEqual(section);
    expect(currentSubsection).toEqual(subsection);
    expect(currentItem).toEqual(subsection);
  });

  it('title only updates if changed', async () => {
    renderComponent();

    let editButton = await screen.findByTestId('subsection-edit-button');
    fireEvent.click(editButton);
    let editField = await screen.findByTestId('subsection-edit-field');
    fireEvent.blur(editField);

    expect(onEditSubectionSubmit).not.toHaveBeenCalled();

    editButton = await screen.findByTestId('subsection-edit-button');
    fireEvent.click(editButton);
    editField = await screen.findByTestId('subsection-edit-field');
    fireEvent.change(editField, { target: { value: 'some random value' } });
    fireEvent.keyDown(editField, { key: 'Enter', keyCode: 13 });
    expect(onEditSubectionSubmit).toHaveBeenCalled();
  });

  it('hides header based on isHeaderVisible flag', async () => {
    renderComponent({
      subsection: {
        ...subsection,
        isHeaderVisible: false,
      },
    });
    expect(screen.queryByTestId('subsection-card-header')).not.toBeInTheDocument();
  });

  it('hides add new, duplicate & delete option based on childAddable, duplicable & deletable action flag', async () => {
    renderComponent({
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
    const element = await screen.findByTestId('subsection-card');
    const menu = await within(element).findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menu));
    expect(within(element).queryByTestId('subsection-card-header__menu-duplicate-button')).not.toBeInTheDocument();
    expect(within(element).queryByTestId('subsection-card-header__menu-delete-button')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New unit' })).not.toBeInTheDocument();
  });

  it('renders live status', async () => {
    renderComponent();
    expect(await screen.findByText(cardHeaderMessages.statusBadgeLive.defaultMessage)).toBeInTheDocument();
  });

  it('renders published but live status', async () => {
    renderComponent({
      subsection: {
        ...subsection,
        published: true,
        visibilityState: 'ready',
      },
    });
    expect(await screen.findByText(cardHeaderMessages.statusBadgePublishedNotLive.defaultMessage)).toBeInTheDocument();
  });

  it('renders staff status', async () => {
    renderComponent({
      subsection: {
        ...subsection,
        published: false,
        visibilityState: 'staff_only',
      },
    });
    expect(await screen.findByText(cardHeaderMessages.statusBadgeStaffOnly.defaultMessage)).toBeInTheDocument();
  });

  it('renders draft status', async () => {
    renderComponent({
      subsection: {
        ...subsection,
        published: false,
        visibilityState: 'needs_attention',
        hasChanges: true,
      },
    });
    expect(await screen.findByText(cardHeaderMessages.statusBadgeDraft.defaultMessage)).toBeInTheDocument();
  });

  it('check extended subsection when URL "show" param in subsection', async () => {
    renderComponent(undefined, `?show=${unit.id}`);

    const cardUnits = await screen.findByTestId('subsection-card__units');
    const newUnitButton = await screen.findByRole('button', { name: 'New unit' });
    expect(cardUnits).toBeInTheDocument();
    expect(newUnitButton).toBeInTheDocument();
  });

  it('check not extended subsection when URL "show" param not in subsection', async () => {
    const randomId = 'random-id';
    renderComponent(undefined, `?show=${randomId}`);

    const cardUnits = screen.queryByTestId('subsection-card__units');
    const newUnitButton = screen.queryByRole('button', { name: 'New unit' });
    expect(cardUnits).toBeNull();
    expect(newUnitButton).toBeNull();
  });

  it('should add unit from library', async () => {
    renderComponent();

    const expandButton = await screen.findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandButton);

    const useUnitFromLibraryButton = screen.getByRole('button', {
      name: /use unit from library/i,
    });
    expect(useUnitFromLibraryButton).toBeInTheDocument();
    fireEvent.click(useUnitFromLibraryButton);

    expect(await screen.findByText('Select unit'));

    // click dummy button to execute onComponentSelected prop.
    const dummyBtn = await screen.findByRole('button', { name: 'Dummy button' });
    fireEvent.click(dummyBtn);

    expect(handleOnAddUnitFromLibrary).toHaveBeenCalled();
    expect(handleOnAddUnitFromLibrary).toHaveBeenCalledWith({
      type: COMPONENT_TYPES.libraryV2,
      parentLocator: '123',
      category: 'vertical',
      libraryContentKey: containerKey,
    });
  });
});

import React from 'react';

import SectionCard from './SectionCard';
import { Xblock } from '../data/types';
import { act, fireEvent, initializeMocks, render, screen, within } from '../../testUtils';

const mockPathname = '/foo-bar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

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
} as Xblock;

const section = {
  id: '123',
  displayName: 'Section Name',
  category: 'chapter',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  highlights: ['highlight 1', 'highlight 2'],
  actions: {
    draggable: true,
    childAddable: true,
    deletable: true,
    duplicable: true,
  },
  isHeaderVisible: true,
  childInfo: {
    children: [{
      id: subsection.id,
      childInfo: {
        children: [{
          id: unit.id,
        }],
      },
    }],
  },
} as Xblock;

const onEditSectionSubmit = jest.fn();

const renderComponent = (props?: object, entry="/") => render(
  <SectionCard
    section={section}
    index={1}
    canMoveItem={jest.fn()}
    onOrderChange={jest.fn()}
    onOpenPublishModal={jest.fn()}
    onOpenHighlightsModal={jest.fn()}
    onOpenDeleteModal={jest.fn()}
    onOpenConfigureModal={jest.fn()}
    savingStatus=""
    onEditSectionSubmit={onEditSectionSubmit}
    onDuplicateSubmit={jest.fn()}
    isSectionsExpanded
    onNewSubsectionSubmit={jest.fn()}
    isSelfPaced={false}
    isCustomRelativeDatesActive={false}
    onAddSubsectionFromLibrary={jest.fn()}
    resetScrollState={jest.fn()}
    {...props}
  >
    <span>children</span>
  </SectionCard>,
  {
    path: '/',
    routerProps: {
      initialEntries: [entry],
    }
  }
);

describe('<SectionCard />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render SectionCard component correctly', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('section-card-header')).toBeInTheDocument();
    expect(getByTestId('section-card__content')).toBeInTheDocument();
  });

  it('expands/collapses the card when the expand button is clicked', () => {
    renderComponent();

    const expandButton = screen.getByTestId('section-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(screen.queryByTestId('section-card__subsections')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: `New subsection` })).not.toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(screen.queryByTestId('section-card__subsections')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New subsection' })).toBeInTheDocument();
  });

  it('title only updates if changed', async () => {
    const { findByTestId } = renderComponent();

    let editButton = await findByTestId('section-edit-button');
    fireEvent.click(editButton);
    let editField = await findByTestId('section-edit-field');
    fireEvent.blur(editField);

    expect(onEditSectionSubmit).not.toHaveBeenCalled();

    editButton = await findByTestId('section-edit-button');
    fireEvent.click(editButton);
    editField = await findByTestId('section-edit-field');
    fireEvent.change(editField, { target: { value: 'some random value' } });
    fireEvent.blur(editField);
    expect(onEditSectionSubmit).toHaveBeenCalled();
  });

  it('hides header based on isHeaderVisible flag', async () => {
    const { queryByTestId } = renderComponent({
      section: {
        ...section,
        isHeaderVisible: false,
      },
    });
    expect(queryByTestId('section-card-header')).not.toBeInTheDocument();
  });

  it('hides add new, duplicate & delete option based on childAddable, duplicable & deletable action flag', async () => {
    const { findByTestId, queryByTestId } = renderComponent({
      section: {
        ...section,
        actions: {
          draggable: true,
          childAddable: false,
          deletable: false,
          duplicable: false,
        },
      },
    });
    const element = await findByTestId('section-card');
    const menu = await within(element).findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(menu));
    expect(within(element).queryByTestId('section-card-header__menu-duplicate-button')).not.toBeInTheDocument();
    expect(within(element).queryByTestId('section-card-header__menu-delete-button')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New subsection' })).not.toBeInTheDocument();
  });

  it('check extended section when URL "show" param in subsection under section', async () => {
    const collapsedSections = { ...section };
    // @ts-ignore-next-line
    collapsedSections.isSectionsExpanded = false;
    const { findByTestId } = renderComponent(collapsedSections, `?show=${subsection.id}`);

    const cardSubsections = await findByTestId('section-card__subsections');
    const newSubsectionButton = await screen.findByRole('button', { name: 'New subsection' });
    expect(cardSubsections).toBeInTheDocument();
    expect(newSubsectionButton).toBeInTheDocument();
  });

  it('check extended section when URL "show" param in unit under section', async () => {
    const collapsedSections = { ...section };
    // @ts-ignore-next-line
    collapsedSections.isSectionsExpanded = false;
    const { findByTestId } = renderComponent(collapsedSections, `?show=${unit.id}`);

    const cardSubsections = await findByTestId('section-card__subsections');
    const newSubsectionButton = await screen.findByRole('button', { name: 'New subsection' });
    expect(cardSubsections).toBeInTheDocument();
    expect(newSubsectionButton).toBeInTheDocument();
  });

  it('check not extended section when URL "show" param not in section', async () => {
    const randomId = 'random-id';
    const collapsedSections = { ...section };
    // @ts-ignore-next-line
    collapsedSections.isSectionsExpanded = false;
    const { queryByTestId } = renderComponent(collapsedSections, `?show=${randomId}`);

    const cardSubsections = queryByTestId('section-card__subsections');
    const newSubsectionButton = screen.queryByRole('button', { name: 'New subsection' });
    expect(cardSubsections).toBeNull();
    expect(newSubsectionButton).toBeNull();
  });
});

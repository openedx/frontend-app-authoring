import React from 'react';
import {
  act, render, fireEvent, within,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import initializeStore from '../../store';
import SectionCard from './SectionCard';

// eslint-disable-next-line no-unused-vars
let axiosMock;
let store;

const section = {
  id: '123',
  displayName: 'Section Name',
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
};

const onEditSectionSubmit = jest.fn();

const queryClient = new QueryClient();

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        <SectionCard
          section={section}
          index="1"
          canMoveItem={jest.fn()}
          onOrderChange={jest.fn()}
          onOpenPublishModal={jest.fn()}
          onOpenHighlightsModal={jest.fn()}
          onOpenDeleteModal={jest.fn()}
          savingStatus=""
          onEditSectionSubmit={onEditSectionSubmit}
          onDuplicateSubmit={jest.fn()}
          isSectionsExpanded
          onNewSubsectionSubmit={jest.fn()}
          {...props}
        >
          <span>children</span>
        </SectionCard>
      </IntlProvider>
    </QueryClientProvider>
  </AppProvider>,
);

describe('<SectionCard />', () => {
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('render SectionCard component correctly', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('section-card-header')).toBeInTheDocument();
    expect(getByTestId('section-card__content')).toBeInTheDocument();
  });

  it('expands/collapses the card when the expand button is clicked', () => {
    const { queryByTestId, getByTestId } = renderComponent();

    const expandButton = getByTestId('section-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(queryByTestId('section-card__subsections')).not.toBeInTheDocument();
    expect(queryByTestId('new-subsection-button')).not.toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(queryByTestId('section-card__subsections')).toBeInTheDocument();
    expect(queryByTestId('new-subsection-button')).toBeInTheDocument();
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
    expect(queryByTestId('new-subsection-button')).not.toBeInTheDocument();
  });
});

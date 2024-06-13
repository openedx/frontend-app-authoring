import React from 'react';
import {
  act, render, fireEvent, within,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import initializeStore from '../../store';
import UnitCard from './UnitCard';
import cardMessages from '../card-header/messages';

let store;

const section = {
  id: '1',
  displayName: 'Section Name',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
  highlights: ['highlight 1', 'highlight 2'],
};

const subsection = {
  id: '12',
  displayName: 'Subsection Name',
  published: true,
  visibilityState: 'live',
  hasChanges: false,
};

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
};

const queryClient = new QueryClient();

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
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
          onCopyToClipboardClick={jest.fn()}
          savingStatus=""
          onEditSubmit={jest.fn()}
          onDuplicateSubmit={jest.fn()}
          getTitleLink={(id) => `/some/${id}`}
          isSelfPaced={false}
          isCustomRelativeDatesActive={false}
          {...props}
        />
      </IntlProvider>
    </QueryClientProvider>
  </AppProvider>,
);

describe('<UnitCard />', () => {
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
});

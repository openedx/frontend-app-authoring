import React from 'react';

import '@testing-library/jest-dom';
import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import {
  filterKeys, filterMessages, sortKeys, sortMessages,
} from '../../containers/VideoGallery/utils';
import SearchSort from './SearchSort';
import messages from './messages';

jest.unmock('react-redux');
jest.unmock('@edx/frontend-platform/i18n');
jest.unmock('@openedx/paragon');
jest.unmock('@openedx/paragon/icons');

describe('SearchSort component', () => {
  const props = {
    searchString: '',
    onSearchChange: jest.fn()
      .mockName('props.onSearchChange'),
    clearSearchString: jest.fn()
      .mockName('props.clearSearchString'),
    sortBy: sortKeys.dateOldest,
    sortKeys,
    sortMessages,
    onSortClick: jest.fn()
      .mockName('props.onSortClick'),
    switchMessage: {
      id: 'test.id',
      defaultMessage: 'test message',
    },
    filterBy: filterKeys.anyStatus,
    onFilterClick: jest.fn(),
    filterKeys,
    filterMessages,
    showSwitch: true,
  };

  function getComponent(overrideProps = {}) {
    return render(
      <IntlProvider locale="en">
        <SearchSort {...props} {...overrideProps} />
      </IntlProvider>,
    );
  }

  test('adds a sort option for each sortKey', async () => {
    const { getByRole } = getComponent();
    await act(() => {
      fireEvent.click(screen.getByRole('button', {
        name: /By oldest/i,
      }));
    });
    Object.values(sortMessages)
      .forEach(({ defaultMessage }) => {
        expect(getByRole('link', { name: `By ${defaultMessage}` }))
          .toBeInTheDocument();
      });
  });
  test('adds a sort option for each sortKey', async () => {
    const { getByRole } = getComponent();
    await act(() => {
      fireEvent.click(screen.getByRole('button', { name: /oldest/i }));
    });
    Object.values(sortMessages)
      .forEach(({ defaultMessage }) => {
        expect(getByRole('link', { name: `By ${defaultMessage}` }))
          .toBeInTheDocument();
      });
  });
  test('adds a filter option for each filter key', async () => {
    const { getByTestId } = getComponent();
    act(() => {
      fireEvent.click(getByTestId('dropdown-filter'));
    });

    Object.keys(filterMessages)
      .forEach((key) => {
        expect(getByTestId(`dropdown-filter-${key}`))
          .toBeInTheDocument();
      });
  });
  test('searchbox should show clear message button when not empty', async () => {
    const { queryByRole } = getComponent({ searchString: 'some string' });
    expect(queryByRole('button', { name: messages.clearSearch.defaultMessage }))
      .toBeInTheDocument();
  });
});

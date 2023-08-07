import React from 'react';

import '@testing-library/jest-dom';
import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { sortKeys, sortMessages } from '../ImageUploadModal/SelectImageModal/utils';
import { filterMessages } from '../../containers/VideoGallery/utils';
import { SearchSort } from './SearchSort';
import messages from './messages';

jest.unmock('react-redux');
jest.unmock('@edx/frontend-platform/i18n');
jest.unmock('@edx/paragon');
jest.unmock('@edx/paragon/icons');

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
    onFilterClick: jest.fn(),
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
        name: /by date added \(oldest\)/i,
      }));
    });
    Object.values(sortMessages)
      .forEach(({ defaultMessage }) => {
        expect(getByRole('link', { name: defaultMessage }))
          .toBeInTheDocument();
      });
  });
  test('adds a sort option for each sortKey', async () => {
    const { getByRole } = getComponent();
    await act(() => {
      fireEvent.click(screen.getByRole('button', { name: /by date added \(oldest\)/i }));
    });
    Object.values(sortMessages)
      .forEach(({ defaultMessage }) => {
        expect(getByRole('link', { name: defaultMessage }))
          .toBeInTheDocument();
      });
  });
  test('adds a filter option for each filterKet', async () => {
    const { getByRole } = getComponent();
    await act(() => {
      fireEvent.click(screen.getByRole('button', { name: /video status/i }));
    });
    Object.keys(filterMessages)
      .forEach((key) => {
        if (key !== 'title') {
          expect(getByRole('checkbox', { name: filterMessages[key].defaultMessage }))
            .toBeInTheDocument();
        }
      });
  });
  test('searchbox should show clear message button when not empty', async () => {
    const { queryByRole } = getComponent({ searchString: 'some string' });
    expect(queryByRole('button', { name: messages.clearSearch.defaultMessage }))
      .toBeInTheDocument();
  });
});

import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { configureStore } from '@reduxjs/toolkit';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoUploadEditor from '.';

jest.unmock('react-redux');
jest.unmock('@edx/frontend-platform/i18n');
jest.unmock('@openedx/paragon');
jest.unmock('@openedx/paragon/icons');

describe('VideoUploadEditor', () => {
  let store;

  const renderComponent = async (storeParam) => render(
    <AppProvider store={storeParam}>
      <IntlProvider locale="en">
        <VideoUploadEditor />
      </IntlProvider>,
    </AppProvider>,
  );

  beforeEach(async () => {
    store = configureStore({
      reducer: (state, action) => ((action && action.newState) ? action.newState : state),
      preloadedState: {},
    });

    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'test-user',
        administrator: true,
        roles: [],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected with default behavior', async () => {
    expect(await renderComponent(store)).toMatchSnapshot();
  });

  it('calls window.history.back when close button is clicked', async () => {
    const container = await renderComponent(store);
    const closeButton = container.getAllByRole('button', { name: /close/i });
    const oldHistoryBack = window.history.back;
    window.history.back = jest.fn();

    expect(closeButton).toHaveLength(1);
    expect(window.history.back).not.toHaveBeenCalled();
    closeButton.forEach((button) => fireEvent.click(button));
    expect(window.history.back).toHaveBeenCalled();

    window.history.back = oldHistoryBack;
  });
});

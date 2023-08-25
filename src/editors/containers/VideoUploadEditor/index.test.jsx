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
jest.unmock('@edx/paragon');
jest.unmock('@edx/paragon/icons');

describe('VideoUploadEditor', () => {
  const onCloseMock = jest.fn();
  let store;

  const renderComponent = async (storeParam, onCloseMockParam) => render(
    <AppProvider store={storeParam}>
      <IntlProvider locale="en">
        <VideoUploadEditor onClose={onCloseMockParam} />
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
    expect(await renderComponent(store, onCloseMock)).toMatchSnapshot();
  });

  it('calls onClose when close button is clicked', async () => {
    const container = await renderComponent(store, onCloseMock);
    const closeButton = container.getAllByRole('button', { name: /close/i });
    expect(closeButton).toHaveLength(1);
    closeButton.forEach((button) => fireEvent.click(button));
    expect(onCloseMock).toHaveBeenCalled();
  });
});

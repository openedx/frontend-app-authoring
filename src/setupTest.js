import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import PropTypes from 'prop-types';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { configureStore } from '@reduxjs/toolkit';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Context as ResponsiveContext } from 'react-responsive';
import { render as rtlRender } from '@testing-library/react';
import AppProvider from '@edx/frontend-platform/react/AppProvider';
import MockAdapter from 'axios-mock-adapter';
import ReactDOM from 'react-dom';
import { reducer as modelsReducer } from './generic/model-store';
import { reducer as courseDetailReducer } from './data/slice';
import { reducer as discussionsReducer } from './pages-and-resources/discussions';
import { reducer as pagesAndResourcesReducer } from './pages-and-resources/data/slice';

// Modal creates a portal.  Overriding ReactDOM.createPortal allows portals to be tested in jest.
ReactDOM.createPortal = node => node;

// Mock Intersection Observer which is unavailable in the context of a test.
global.IntersectionObserver = jest.fn(function mockIntersectionObserver() {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
});

// Mock getComputedStyle which some Paragon components use to do size calculations.  In general
// These calculations don't matter for our test suite.
window.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(),
}));

let globalStore;

// eslint-disable-next-line import/prefer-default-export,no-unused-vars
export async function initializeTestStore(options = {}, overrideStore = true) {
  const store = configureStore({
    reducer: {
      courseDetail: courseDetailReducer,
      discussions: discussionsReducer,
      pagesAndResources: pagesAndResourcesReducer,
      models: modelsReducer,
    },
  });
  if (overrideStore) {
    globalStore = store;
  }
  initializeMockApp();
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock.reset();
  return store;
}

function render(
  ui,
  {
    store = null,
    ...renderOptions
  } = {},
  screenWidth = 1280,
) {
  function Wrapper({ children }) {
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <AppProvider store={store || globalStore}>
        <ResponsiveContext.Provider value={{ width: screenWidth }}>
          <IntlProvider locale="en">
            {children}
          </IntlProvider>
        </ResponsiveContext.Provider>
      </AppProvider>
    );
  }

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything.
export * from '@testing-library/react';

// Override `render` method.
export {
  render,
};

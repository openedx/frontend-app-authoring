import React from 'react';
import PropTypes from 'prop-types';

import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';

import { reducer as modelsReducer } from '../generic/model-store';
import { reducer as pagesAndResourcesReducer } from './data/slice';
import PagesAndResourcesProvider from './PagesAndResourcesProvider';

function renderWithProviders(
  ui,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore(
      {
        reducer: { pagesAndResources: pagesAndResourcesReducer, models: modelsReducer }, preloadedState,
      },
    ),
    ...renderOptions
  } = {},
) {
  const Wrapper = ({ children }) => (
    <IntlProvider locale="en">
      {/* <MemoryRouter initialEntries={['/pages-and-resources']}> */}
      <PagesAndResourcesProvider courseId="course-v1:edX+TestX+Test_Course">
        <BrowserRouter>
          <Provider store={store}>{children}</Provider>
        </BrowserRouter>
      </PagesAndResourcesProvider>
      {/* </MemoryRouter> */}
    </IntlProvider>
  );

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// We may add additional exports to this file over time, so we will not export render as the default.
export { renderWithProviders as render };

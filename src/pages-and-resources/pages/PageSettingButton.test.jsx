import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import PageSettingButton from './PageSettingButton';
import messages from '../messages';

const mockStore = configureStore([]);

const renderComponent = (props, store) => {
  render(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages}>
        <MemoryRouter>
          <PageSettingButton {...props} />
        </MemoryRouter>
      </IntlProvider>
    </Provider>,
  );
};

describe('PageSettingButton', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      studioHomeData: {
        waffleFlags: {
          ENABLE_NEW_TEXTBOOKS_PAGE: true,
          ENABLE_NEW_CUSTOM_PAGES: true,
        },
      },
    });
  });

  it('renders a link when legacyLink is provided and matches textbooks condition', () => {
    renderComponent({
      id: 'page_1',
      courseId: 'course_1',
      legacyLink: 'textbooks',
      allowedOperations: {},
    }, store);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/textbooks');
  });

  it('renders a link when legacyLink is provided and matches tabs condition', () => {
    renderComponent({
      id: 'page_2',
      courseId: 'course_2',
      legacyLink: 'tabs',
      allowedOperations: {},
    }, store);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/tabs');
  });

  it('renders an IconButton when allowedOperations allows configuration or enabling', () => {
    renderComponent({
      id: 'page_3',
      courseId: 'course_3',
      allowedOperations: { configure: true },
    }, store);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render anything when neither legacyLink nor allowedOperations allows configuration or enabling', () => {
    renderComponent({
      id: 'page_4',
      courseId: 'course_4',
      allowedOperations: {},
    }, store);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

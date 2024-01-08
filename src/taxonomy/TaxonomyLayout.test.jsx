import React, { useContext } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { render } from '@testing-library/react';

import initializeStore from '../store';
import { TaxonomyContext } from './common/context';
import TaxonomyLayout from './TaxonomyLayout';

let store;
const toastMessage = 'Hello, this is a toast!';
const alertErrorTitle = 'Error title';
const alertErrorDescription = 'Error description';

const MockChildComponent = () => {
  const { setToastMessage, setAlertProps } = useContext(TaxonomyContext);

  return (
    <div data-testid="mock-content">
      <button
        type="button"
        onClick={() => setToastMessage(toastMessage)}
        data-testid="taxonomy-show-toast"
      >
        Show Toast
      </button>
      <button
        type="button"
        onClick={() => setAlertProps({ title: alertErrorTitle, description: alertErrorDescription })}
        data-testid="taxonomy-show-alert"
      >
        Show Alert
      </button>
    </div>
  );
};

jest.mock('../header', () => jest.fn(() => <div data-testid="mock-header" />));
jest.mock('@edx/frontend-component-footer', () => ({
  StudioFooter: jest.fn(() => <div data-testid="mock-footer" />),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <MockChildComponent />,
  ScrollRestoration: jest.fn(() => <div />),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <TaxonomyLayout />
    </IntlProvider>
  </AppProvider>
);

describe('<TaxonomyLayout />', async () => {
  beforeEach(async () => {
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

  it('should render page correctly', () => {
    const { getByTestId } = render(<RootWrapper />);
    expect(getByTestId('mock-header')).toBeInTheDocument();
    expect(getByTestId('mock-content')).toBeInTheDocument();
    expect(getByTestId('mock-footer')).toBeInTheDocument();
  });

  it('should show toast', () => {
    const { getByTestId, getByText } = render(<RootWrapper />);
    const button = getByTestId('taxonomy-show-toast');
    button.click();
    expect(getByTestId('taxonomy-toast')).toBeInTheDocument();
    expect(getByText(toastMessage)).toBeInTheDocument();
  });

  it('should show alert', () => {
    const { getByTestId, getByText, getByRole } = render(<RootWrapper />);
    const button = getByTestId('taxonomy-show-alert');
    button.click();
    expect(getByTestId('taxonomy-alert')).toBeInTheDocument();
    expect(getByText(alertErrorTitle)).toBeInTheDocument();
    expect(getByText(alertErrorDescription)).toBeInTheDocument();

    const closeAlertButton = getByRole('button', { name: 'Dismiss' });
    closeAlertButton.click();
    expect(() => getByTestId('taxonomy-alert')).toThrow();
  });
});

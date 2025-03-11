import React, { useContext } from 'react';

import { initializeMocks, render, screen } from '../testUtils';
import { TaxonomyContext } from './common/context';
import { TaxonomyLayout } from './TaxonomyLayout';

const toastMessage = 'Hello, this is a toast!';
const alertErrorTitle = 'Error title';
const alertErrorDescription = 'Error description';

const MockChildComponent = () => {
  const { setToastMessage, setAlertError } = useContext(TaxonomyContext);

  return (
    <div data-testid="mock-content">
      <button
        type="button"
        onClick={() => setToastMessage!(toastMessage)}
        data-testid="taxonomy-show-toast"
      >
        Show Toast
      </button>
      <button
        type="button"
        onClick={() => setAlertError!({ title: alertErrorTitle, error: new Error(alertErrorDescription) })}
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

describe('<TaxonomyLayout />', () => {
  beforeEach(async () => {
    initializeMocks();
  });

  it('should render page correctly', () => {
    render(<TaxonomyLayout />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-content')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  it('should show toast', () => {
    render(<TaxonomyLayout />);
    const button = screen.getByTestId('taxonomy-show-toast');
    button.click();
    expect(screen.getByTestId('taxonomy-toast')).toBeInTheDocument();
    expect(screen.getByText(toastMessage)).toBeInTheDocument();
  });

  it('should show alert', () => {
    render(<TaxonomyLayout />);

    const button = screen.getByTestId('taxonomy-show-alert');
    button.click();
    expect(screen.getByText(alertErrorTitle)).toBeInTheDocument();
    expect(screen.getByText(alertErrorDescription)).toBeInTheDocument();

    const closeAlertButton = screen.getByRole('button', { name: 'Dismiss' });
    closeAlertButton.click();
    expect(screen.queryByText(alertErrorTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(alertErrorDescription)).not.toBeInTheDocument();
  });
});

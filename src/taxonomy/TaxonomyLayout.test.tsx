import React, { useContext } from 'react';

import userEvent from '@testing-library/user-event';
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
  StudioFooterSlot: jest.fn(() => <div data-testid="mock-footer" />),
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

  it('should show toast', async () => {
    render(<TaxonomyLayout />);
    const button = await screen.findByTestId('taxonomy-show-toast');
    button.click();
    await screen.findByTestId('taxonomy-toast');
    await screen.findByText(toastMessage);
  });

  it('should show alert', async () => {
    const user = userEvent.setup();
    render(<TaxonomyLayout />);

    const button = await screen.findByTestId('taxonomy-show-alert');
    await user.click(button);
    expect(screen.getByText(alertErrorTitle)).toBeInTheDocument();
    expect(screen.getByText(alertErrorDescription)).toBeInTheDocument();

    const closeAlertButton = await screen.findByRole('button', { name: 'Dismiss' });
    await user.click(closeAlertButton);
    expect(screen.queryByText(alertErrorTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(alertErrorDescription)).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { ToastContext, ToastProvider } from '.';
import initializeStore from '../../store';

interface WraperProps {
  children: React.ReactNode;
}

const TestIcon = () => <svg data-testid="test-icon" />;

const TestComponentToShow = () => {
  const { showToast } = React.useContext(ToastContext);

  React.useEffect(() => {
    showToast('This is the Toast!');
  }, [showToast]);

  return <div>Content</div>;
};

const TestComponentToClose = () => {
  const { showToast, closeToast } = React.useContext(ToastContext);

  React.useEffect(() => {
    showToast('This is the Toast!');
    closeToast();
  }, [showToast]);

  return <div>Content</div>;
};

const TestComponentWithDelay = ({ delay }: { delay: number; }) => {
  const { showToast } = React.useContext(ToastContext);

  React.useEffect(() => {
    showToast('This is the Toast!', undefined, delay);
  }, [showToast]);

  return <div>Content</div>;
};

const TestComponentWithIcon = () => {
  const { showToast } = React.useContext(ToastContext);

  React.useEffect(() => {
    showToast('This is the Toast!', undefined, undefined, TestIcon);
  }, [showToast]);

  return <div>Content</div>;
};

let store;
const RootWrapper = ({ children }: WraperProps) => (
  <AppProvider store={store}>
    <ToastProvider>
      {children}
    </ToastProvider>
  </AppProvider>
);

describe('<ToastProvider />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show toast', async () => {
    render(
      <RootWrapper>
        <TestComponentToShow />
      </RootWrapper>,
    );
    expect(await screen.findByText('This is the Toast!')).toBeInTheDocument();
  });

  it('should render the toast icon instead of the spinner', async () => {
    render(
      <RootWrapper>
        <TestComponentWithIcon />
      </RootWrapper>,
    );
    expect(await screen.findByText('This is the Toast!')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(document.querySelector('.toast-notification-spinner')).not.toBeInTheDocument();
  });

  it('should render the spinning gear icon by default', async () => {
    render(
      <RootWrapper>
        <TestComponentToShow />
      </RootWrapper>,
    );
    expect(await screen.findByText('This is the Toast!')).toBeInTheDocument();
    expect(document.querySelector('.toast-notification-spinner')).toBeInTheDocument();
  });

  it('should close toast after 5000ms', async () => {
    render(
      <RootWrapper>
        <TestComponentToShow />
      </RootWrapper>,
    );
    expect(await screen.findByText('This is the Toast!')).toBeInTheDocument();
    jest.advanceTimersByTime(6000);
    expect(screen.queryByText('This is the Toast!')).not.toBeInTheDocument();
  });

  it('should close toast', async () => {
    render(
      <RootWrapper>
        <TestComponentToClose />
      </RootWrapper>,
    );
    expect(await screen.findByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('This is the Toast!')).not.toBeInTheDocument();
  });

  it('should keep toast visible past default delay when custom delay is provided', async () => {
    render(
      <RootWrapper>
        <TestComponentWithDelay delay={10000} />
      </RootWrapper>,
    );
    expect(await screen.findByText('This is the Toast!')).toBeInTheDocument();
    // Still visible after the default 5000ms delay
    jest.advanceTimersByTime(6000);
    expect(screen.queryByText('This is the Toast!')).toBeInTheDocument();
    // Gone after the custom 10000ms delay
    jest.advanceTimersByTime(5000);
    expect(screen.queryByText('This is the Toast!')).not.toBeInTheDocument();
  });
});

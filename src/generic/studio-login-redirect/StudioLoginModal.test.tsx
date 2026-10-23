import { act, initializeMocks, render, screen, userEvent } from '@src/testUtils';

import type { SignInPromptStatus } from '.';
import StudioLoginModal from './StudioLoginModal';
import messages from './messages';

const mockPrompt: { status: SignInPromptStatus; listeners: Set<() => void>; } = {
  status: 'closed',
  listeners: new Set(),
};
const mockStartSignIn = jest.fn();
const mockCancelSignIn = jest.fn();
const mockContinueAfterSignIn = jest.fn();

jest.mock('.', () => ({
  subscribeToSignInPrompt: (listener: () => void) => {
    mockPrompt.listeners.add(listener);
    return () => mockPrompt.listeners.delete(listener);
  },
  getSignInPromptStatus: () => mockPrompt.status,
  getStudioLoginUrl: () => 'http://studio.example.com/login/',
  startSignIn: () => mockStartSignIn(),
  cancelSignIn: () => mockCancelSignIn(),
  continueAfterSignIn: () => mockContinueAfterSignIn(),
}));

const setStatus = (status: SignInPromptStatus) => {
  act(() => {
    mockPrompt.status = status;
    mockPrompt.listeners.forEach((listener) => listener());
  });
};

describe('<StudioLoginModal />', () => {
  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
    mockPrompt.status = 'closed';
    mockPrompt.listeners.clear();
  });

  it('shows nothing while there is a Studio session', () => {
    render(<StudioLoginModal />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the Studio login in a new tab', async () => {
    render(<StudioLoginModal />);
    setStatus('signedOut');

    expect(screen.getByRole('dialog', { name: messages.title.defaultMessage })).toBeInTheDocument();
    expect(screen.getByText(messages.signedOutDescription.defaultMessage)).toBeInTheDocument();
    const signIn = screen.getByRole('link', { name: messages.signInButton.defaultMessage });
    expect(signIn).toHaveAttribute('href', 'http://studio.example.com/login/');
    expect(signIn).toHaveAttribute('target', '_blank');

    await userEvent.click(signIn);

    expect(mockStartSignIn).toHaveBeenCalledTimes(1);
  });

  it('continues once the user is back from the other tab', async () => {
    render(<StudioLoginModal />);
    setStatus('signingIn');

    expect(screen.getByText(messages.signingInDescription.defaultMessage)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: messages.continueButton.defaultMessage }));

    expect(mockContinueAfterSignIn).toHaveBeenCalledTimes(1);
  });

  it('cannot continue, cancel or open the login again while checking the sign-in', () => {
    render(<StudioLoginModal />);
    setStatus('checking');

    expect(screen.getByText(messages.checkingDescription.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.continueButton.defaultMessage })).toBeDisabled();
    expect(screen.getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeDisabled();
    expect(screen.queryByRole('link', { name: messages.signInButton.defaultMessage })).not.toBeInTheDocument();
  });

  it('can open the login again when the user came back without signing in', async () => {
    render(<StudioLoginModal />);
    setStatus('stillSignedOut');

    expect(screen.getByText(messages.stillSignedOutDescription.defaultMessage)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: messages.signInButton.defaultMessage }));

    expect(mockStartSignIn).toHaveBeenCalledTimes(1);
  });

  it('is not cancelled by Escape', async () => {
    render(<StudioLoginModal />);
    setStatus('signedOut');

    await userEvent.keyboard('{Escape}');

    expect(mockCancelSignIn).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('cancels', async () => {
    render(<StudioLoginModal />);
    setStatus('signedOut');

    await userEvent.click(screen.getByRole('button', { name: messages.cancelButton.defaultMessage }));

    expect(mockCancelSignIn).toHaveBeenCalledTimes(1);
  });

  it('closes when the user signed in', () => {
    render(<StudioLoginModal />);
    setStatus('checking');

    setStatus('closed');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '../../../testUtils';
import ErrorAlert, { hooks } from './ErrorAlert';

describe('ErrorAlert (integration, no Paragon mocks)', () => {
  beforeEach(() => {
    initializeMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders nothing if isError is false', () => {
    render(<ErrorAlert isError={false}>Some error</ErrorAlert>);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders nothing if isDismissed is true', () => {
    jest.spyOn(hooks, 'dismissalHooks').mockReturnValue({
      isDismissed: true,
      dismissAlert: jest.fn(),
    });
    render(<ErrorAlert isError>Some error</ErrorAlert>);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders alert with heading and children when isError is true', () => {
    jest.spyOn(hooks, 'dismissalHooks').mockReturnValue({
      isDismissed: false,
      dismissAlert: jest.fn(),
    });
    render(<ErrorAlert isError>Some error</ErrorAlert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Some error')).toBeInTheDocument();
  });

  it('renders alert without heading when hideHeading is true', () => {
    render(<ErrorAlert isError hideHeading>Some error</ErrorAlert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Error')).toBeNull();
    expect(screen.getByText('Some error')).toBeInTheDocument();
  });

  it('calls dismissError when dismiss button is clicked', () => {
    const dismissError = jest.fn();
    render(<ErrorAlert isError dismissError={dismissError}>Some error</ErrorAlert>);
    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    expect(dismissError).toHaveBeenCalled();
  });

  it('does not throw if dismissError is not provided and dismiss button is clicked', () => {
    render(<ErrorAlert isError>Some error</ErrorAlert>);
    const closeBtn = screen.getByRole('button');
    expect(() => fireEvent.click(closeBtn)).not.toThrow();
  });

  it('renders children as array', () => {
    render(<ErrorAlert isError>{['foo', <span key="bar">bar</span>]}</ErrorAlert>);
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('resets isDismissed when isError changes from false to true', () => {
    const { rerender } = render(<ErrorAlert isError={false}>err</ErrorAlert>);
    expect(screen.queryByRole('alert')).toBeNull();
    rerender(<ErrorAlert isError>err</ErrorAlert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('dismisses alert when dismiss button is clicked (integration)', () => {
    const dismissError = jest.fn();
    render(<ErrorAlert isError dismissError={dismissError}>err</ErrorAlert>);
    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('alert')).toBeNull();
    expect(dismissError).toHaveBeenCalled();
  });
});

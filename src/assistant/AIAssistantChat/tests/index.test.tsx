import React from 'react';
import userEvent from '@testing-library/user-event';

import AIAssistantChat from '..';
import {
  render, screen, waitFor, initializeMocks,
} from '../../../testUtils';

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect);

describe('AIAssistantChat', () => {
  const mockOnSend = jest.fn();

  const defaultProps = {
    messages: [
      { id: '1', type: 'user' as const, text: 'Hello, explain React components.' },
      { id: '2', type: 'ai' as const, text: 'React components are reusable building blocks.' },
    ],
    onSend: mockOnSend,
    isLoading: false,
    isReady: true,
    placeholder: 'Type your question...',
  };

  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
  });

  test('should render the chat component and display messages correctly', () => {
    render(<AIAssistantChat {...defaultProps} />);

    expect(screen.getByPlaceholderText(/Type your question/i)).toBeInTheDocument();
    expect(screen.getByText(/Hello, explain React components/i)).toBeInTheDocument();
    expect(screen.getByText(/React components are reusable building blocks/i)).toBeInTheDocument();
  });

  test('should call onSend with prompt and reset the form on submission', async () => {
    render(<AIAssistantChat {...defaultProps} />);

    const input = screen.getByPlaceholderText(/Type your question/i);

    const sendButton = screen.getByRole('button');

    const testPrompt = 'Write a test case for Formik.';

    userEvent.type(input, testPrompt);
    expect(input).toHaveValue(testPrompt);

    userEvent.click(sendButton);

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSend).toHaveBeenCalledWith(testPrompt);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  test('should disable the send button when isReady is false', () => {
    render(<AIAssistantChat {...defaultProps} isReady={false} />);
    const sendButton = screen.getByRole('button');

    expect(sendButton).toBeDisabled();
  });

  test('should display Spinner and disable the button when isLoading is true', () => {
    render(<AIAssistantChat {...defaultProps} isLoading />);

    const sendButton = screen.getByRole('button');

    expect(sendButton).toBeDisabled();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('should disable the send button when the input is empty or only whitespace', async () => {
    render(<AIAssistantChat {...defaultProps} />);

    const input = screen.getByPlaceholderText(/Type your question/i);
    const sendButton = screen.getByRole('button');

    expect(sendButton).toBeDisabled();

    userEvent.type(input, 'test');
    expect(sendButton).not.toBeDisabled();

    userEvent.clear(input);
    expect(sendButton).toBeDisabled();

    userEvent.type(input, '   ');
    expect(sendButton).toBeDisabled();
  });

  test('should use the provided placeholder text', () => {
    const customPlaceholder = 'Ask the AI to do something cool.';
    render(<AIAssistantChat {...defaultProps} placeholder={customPlaceholder} />);

    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });
});

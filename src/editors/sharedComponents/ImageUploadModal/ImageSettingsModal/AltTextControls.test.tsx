import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import AltTextControls from './AltTextControls';

describe('AltTextControls', () => {
  const props = {
    isDecorative: true,
    value: 'props.value',
    setValue: jest.fn().mockName('props.setValue'),
    setIsDecorative: jest.fn().mockName('props.setIsDecorative'),
    validation: { show: false },
    error: { show: false },
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('renders component on screen', () => {
    render(<AltTextControls {...props} />);
    expect(screen.getByRole('checkbox', { name: 'This image is decorative (no alt text required).' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Accessibility' })).toBeInTheDocument();
  });

  test('renders validation feedback when validation.show is true', () => {
    const feedbackMessage = 'Enter alt text';
    render(<AltTextControls {...props} validation={{ show: true }} />);
    expect(screen.getByText(feedbackMessage)).toBeInTheDocument();
  });

  test('does not render validation feedback when validation.show is false', () => {
    const feedbackMessage = 'Enter alt text';
    render(<AltTextControls {...props} validation={{ show: false }} />);
    expect(screen.queryByText(feedbackMessage)).not.toBeInTheDocument();
  });

  test('disables textbox when isDecorative is true', () => {
    render(<AltTextControls {...props} isDecorative />);
    expect(screen.getByRole('textbox', { name: 'Accessibility' })).toBeDisabled();
  });

  test('enables textbox when isDecorative is false', () => {
    render(<AltTextControls {...props} isDecorative={false} />);
    expect(screen.getByRole('textbox', { name: 'Accessibility' })).not.toBeDisabled();
  });

  test('calls setValue on textbox change', () => {
    render(<AltTextControls {...props} isDecorative={false} />);
    const textbox = screen.getByRole('textbox', { name: 'Accessibility' });
    fireEvent.change(textbox, { target: { value: 'new alt text' } });
    expect(props.setValue).toHaveBeenCalled();
  });

  test('calls setIsDecorative on checkbox change', () => {
    render(<AltTextControls {...props} />);
    const checkbox = screen.getByRole('checkbox', { name: 'This image is decorative (no alt text required).' });
    checkbox.click();
    expect(props.setIsDecorative).toHaveBeenCalled();
  });
});

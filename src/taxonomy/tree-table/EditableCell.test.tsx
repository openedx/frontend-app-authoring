import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';

import { EditableCell } from './EditableCell';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="en" messages={{}}>{children}</IntlProvider>
);

describe('EditableCell', () => {
  it('renders inline validation message when provided by validator', () => {
    render(
      <EditableCell
        initialValue="bad;value"
        getInlineValidationMessage={() => 'Invalid character in tag name'}
      />,
      { wrapper },
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid character in tag name');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby');
  });

  it('prioritizes explicit errorMessage over validator message', () => {
    render(
      <EditableCell
        initialValue="value"
        errorMessage="Server error"
        getInlineValidationMessage={() => 'Inline message'}
      />,
      { wrapper },
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Server error');
  });

  it('propagates onChange updates from input', () => {
    const onChange = jest.fn();
    render(<EditableCell initialValue="start" onChange={onChange} />, { wrapper });

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'next' } });
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('next');
  });
});
import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render as baseRender, screen } from '@testing-library/react';
import { InplaceTextEditor } from '.';

const mockOnSave = jest.fn();

const RootWrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="en">
    {children}
  </IntlProvider>
);
const render = (component: React.ReactNode) => baseRender(component, { wrapper: RootWrapper });

describe('<InplaceTextEditor />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the text', () => {
    render(<InplaceTextEditor text="Test text" onSave={mockOnSave} />);

    expect(screen.getByText('Test text')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/ })).not.toBeInTheDocument();
  });

  it('should render the edit button', () => {
    render(<InplaceTextEditor text="Test text" onSave={mockOnSave} />);

    expect(screen.getByText('Test text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should edit the text', () => {
    render(<InplaceTextEditor text="Test text" onSave={mockOnSave} />);

    const title = screen.getByText('Test text');
    expect(title).toBeInTheDocument();

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);

    const textBox = screen.getByRole('textbox');

    fireEvent.change(textBox, { target: { value: 'New text' } });
    fireEvent.keyDown(textBox, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(textBox).not.toBeInTheDocument();
    expect(mockOnSave).toHaveBeenCalledWith('New text');
  });

  it('should close edit text on press Escape', async () => {
    render(<InplaceTextEditor text="Test text" onSave={mockOnSave} />);

    const title = screen.getByText('Test text');
    expect(title).toBeInTheDocument();

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);

    const textBox = screen.getByRole('textbox');

    fireEvent.change(textBox, { target: { value: 'New text' } });
    fireEvent.keyDown(textBox, { key: 'Escape', code: 'Escape', charCode: 27 });

    expect(textBox).not.toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});

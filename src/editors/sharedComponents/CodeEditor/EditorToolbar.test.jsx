import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import EditorToolbar from './EditorToolbar';
import messages from './messages';

describe('<EditorToolbar />', () => {
  let mockDispatch;
  let mockFocus;
  let mockEditor;

  const renderWithIntl = (ui) => render(
    <IntlProvider
      locale="en"
      messages={Object.fromEntries(
        Object.entries(messages).map(([, v]) => [v.id, v.defaultMessage]),
      )}
    >
      {ui}
    </IntlProvider>,
  );

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockFocus = jest.fn();
    mockEditor = {
      state: {
        selection: { main: { from: 0, to: 0 } },
      },
      dispatch: mockDispatch,
      focus: mockFocus,
    };
  });

  it('renders all toolbar buttons', () => {
    renderWithIntl(<EditorToolbar editorRef={mockEditor} />);

    expect(screen.getByRole('button', { name: /Heading/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Multiple Choice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Checkboxes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Text Input/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Numerical Input/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dropdown/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explanation/i })).toBeInTheDocument();
  });

  it('inserts heading text when heading button is clicked', () => {
    renderWithIntl(<EditorToolbar editorRef={mockEditor} />);
    fireEvent.click(screen.getByRole('button', { name: /Heading/i }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: expect.objectContaining({ insert: '## Heading\n\n' }),
      }),
    );
    expect(mockFocus).toHaveBeenCalled();
  });

  it('inserts multiple choice when multiple choice button is clicked', () => {
    renderWithIntl(<EditorToolbar editorRef={mockEditor} />);
    fireEvent.click(screen.getByRole('button', { name: /Multiple Choice/i }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: expect.objectContaining({
          insert: expect.stringContaining('( ) Option 1'),
        }),
      }),
    );
  });

  it('inserts checkboxes when checkboxes button is clicked', () => {
    renderWithIntl(<EditorToolbar editorRef={mockEditor} />);
    fireEvent.click(screen.getByRole('button', { name: /Checkboxes/i }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: expect.objectContaining({
          insert: expect.stringContaining('[ ] Incorrect'),
        }),
      }),
    );
  });

  it('inserts text input when text input button is clicked', () => {
    renderWithIntl(<EditorToolbar editorRef={mockEditor} />);
    fireEvent.click(screen.getByRole('button', { name: /Text Input/i }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: expect.objectContaining({
          insert: expect.stringContaining('Type your answer here:'),
        }),
      }),
    );
  });

  it('inserts numerical input when numerical input button is clicked', () => {
    renderWithIntl(<EditorToolbar editorRef={mockEditor} />);
    fireEvent.click(screen.getByRole('button', { name: /Numerical Input/i }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: expect.objectContaining({
          insert: expect.stringContaining('= 100'),
        }),
      }),
    );
  });

  it('inserts dropdown when dropdown button is clicked', () => {
    renderWithIntl(<EditorToolbar editorRef={mockEditor} />);
    fireEvent.click(screen.getByRole('button', { name: /Dropdown/i }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: expect.objectContaining({
          insert: expect.stringContaining('[Dropdown:'),
        }),
      }),
    );
  });

  it('inserts explanation when explanation button is clicked', () => {
    renderWithIntl(<EditorToolbar editorRef={mockEditor} />);
    fireEvent.click(screen.getByRole('button', { name: /Explanation/i }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        changes: expect.objectContaining({
          insert: expect.stringContaining('>> Add explanation'),
        }),
      }),
    );
  });
});

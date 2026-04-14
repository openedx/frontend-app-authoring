import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';

import { CreateRow } from './CreateRow';

const wrapper = ({ children }: { children: React.ReactNode; }) => (
  <IntlProvider locale="en" messages={{}}>{children}</IntlProvider>
);

const baseProps = () => ({
  draftError: '',
  setDraftError: jest.fn(),
  handleCreateRow: jest.fn(),
  setIsCreatingTopRow: jest.fn(),
  exitDraftWithoutSave: jest.fn(),
  createRowMutation: { isPending: false },
  columns: [{ id: 'value' }],
  validate: jest.fn((value: string) => value.trim().length > 0),
});

describe('CreateRow', () => {
  it('saves on Enter when value is valid', () => {
    const props = baseProps();
    render(
      <table>
        <tbody>
          <CreateRow {...(props as any)} />
        </tbody>
      </table>,
      { wrapper },
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  new tag  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(props.handleCreateRow).toHaveBeenCalledWith('new tag');
  });

  it('does not save on Enter when mutation is pending', () => {
    const props = baseProps();
    props.createRowMutation = { isPending: true };

    render(
      <table>
        <tbody>
          <CreateRow {...(props as any)} />
        </tbody>
      </table>,
      { wrapper },
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'pending tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(props.handleCreateRow).not.toHaveBeenCalled();
  });

  it('cancels on Escape and resets draft state', () => {
    const props = baseProps();

    render(
      <table>
        <tbody>
          <CreateRow {...(props as any)} />
        </tbody>
      </table>,
      { wrapper },
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'will cancel' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(props.setDraftError).toHaveBeenCalledWith('');
    expect(props.setIsCreatingTopRow).toHaveBeenCalledWith(false);
    expect(props.exitDraftWithoutSave).toHaveBeenCalled();
  });
});

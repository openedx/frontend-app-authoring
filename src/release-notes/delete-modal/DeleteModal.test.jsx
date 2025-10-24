import React from 'react';
import {
  render, screen, fireEvent, initializeMocks,
} from '../../testUtils';

import DeleteModal from './DeleteModal';
import messages from './messages';

describe('DeleteModal', () => {
  beforeEach(() => initializeMocks());

  test('renders title and description', () => {
    render(<DeleteModal isOpen close={() => {}} onDeleteSubmit={() => {}} />);
    expect(screen.getByText(messages.deleteModalTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.deleteModalDescription.defaultMessage)).toBeInTheDocument();
  });

  test('cancel closes and delete submits', () => {
    const close = jest.fn();
    const onDeleteSubmit = jest.fn();
    render(<DeleteModal isOpen close={close} onDeleteSubmit={onDeleteSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: messages.cancelButton.defaultMessage }));
    expect(close).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: messages.deleteButton.defaultMessage }));
    expect(onDeleteSubmit).toHaveBeenCalled();
  });
});

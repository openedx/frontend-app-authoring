import React from 'react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';

import TypeXToConfirmModal from './TypeXToConfirmModal';

const defaultProps = () => ({
  label: 'Delete item',
  bodyText: 'Dangerous action',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  X: 'DELETE',
  context: { id: 7 },
  isOpen: true,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  setContext: jest.fn(),
});

const renderModal = (props = defaultProps()) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <TypeXToConfirmModal {...props} />
    </IntlProvider>,
  );

describe('TypeXToConfirmModal', () => {
  it('keeps the destructive confirm button disabled until the typed value exactly matches the required confirmation phrase', () => {
    renderModal();

    const input = screen.getByRole('textbox');
    const confirmButton = screen.getByRole('button', { name: 'Delete' });

    expect(confirmButton).toBeDisabled();
    fireEvent.change(input, { target: { value: 'DEL' } });
    expect(confirmButton).toBeDisabled();
    fireEvent.change(input, { target: { value: 'DELETE' } });
    expect(confirmButton).toBeEnabled();
  });

  it('does not enable confirmation for partial, differently cased, or whitespace-padded confirmation text', () => {
    renderModal();

    const input = screen.getByRole('textbox');
    const confirmButton = screen.getByRole('button', { name: 'Delete' });

    ['DEL', 'delete', ' DELETE', 'DELETE ', ' Delete '].forEach(value => {
      fireEvent.change(input, { target: { value } });
      expect(confirmButton).toBeDisabled();
    });
  });

  it('submits on Enter only after the exact confirmation phrase has been entered', async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    renderModal(props);

    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.keyboard('{Enter}');
    expect(props.onConfirm).not.toHaveBeenCalled();

    await user.type(input, 'DELETE');
    await user.keyboard('{Enter}');
    expect(props.onConfirm).toHaveBeenCalledWith(props.context);
  });

  it('resets confirmation state when the modal closes so a reopened dialog starts disabled again', async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    const { rerender } = renderModal(props);

    await user.type(screen.getByRole('textbox'), 'DELETE');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();

    rerender(
      <IntlProvider locale="en" messages={{}}>
        <TypeXToConfirmModal {...props} isOpen={false} />
      </IntlProvider>,
    );

    rerender(
      <IntlProvider locale="en" messages={{}}>
        <TypeXToConfirmModal {...props} isOpen />
      </IntlProvider>,
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('clears the provided context when the modal is closed without confirming', () => {
    const props = defaultProps();
    const { rerender } = renderModal(props);

    rerender(
      <IntlProvider locale="en" messages={{}}>
        <TypeXToConfirmModal {...props} isOpen={false} />
      </IntlProvider>,
    );

    expect(props.setContext).toHaveBeenCalledWith(null);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });
});

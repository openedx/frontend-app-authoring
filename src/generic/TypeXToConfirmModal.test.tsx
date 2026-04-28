import React from 'react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';

import TypeXToConfirmModal from './TypeXToConfirmModal';

const defaultProps = () => ({
  label: 'Delete item',
  bodyText: 'Dangerous action',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  X: 'DELETE',
  confirmPayload: { id: 7 },
  isOpen: true,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  setConfirmPayload: jest.fn(),
});

const renderModal = (props = defaultProps()) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <TypeXToConfirmModal {...props} />
    </IntlProvider>,
  );

describe('TypeXToConfirmModal', () => {
  it('renders the required confirmation phrase with strong emphasis', () => {
    renderModal();

    expect(screen.getByText('DELETE', { selector: 'strong' })).toBeInTheDocument();
  });

  it('keeps the destructive confirm button disabled until the typed value exactly matches the required confirmation phrase', async () => {
    const user = userEvent.setup();
    renderModal();

    const input = screen.getByRole('textbox');
    const confirmButton = screen.getByRole('button', { name: 'Delete' });

    expect(confirmButton).toBeDisabled();
    await user.type(input, 'DEL');
    expect(confirmButton).toBeDisabled();
    await user.type(input, 'ETE');
    expect(confirmButton).toBeEnabled();
  });

  it('does not enable confirmation for partial, differently cased, or whitespace-padded confirmation text', async () => {
    const user = userEvent.setup();
    renderModal();

    const input = screen.getByRole('textbox');
    const confirmButton = screen.getByRole('button', { name: 'Delete' });

    for (const value of ['DEL', 'delete', ' DELETE', 'DELETE ', ' Delete ']) {
      await user.clear(input);
      await user.type(input, value);
      expect(confirmButton).toBeDisabled();
    }
  });

  it('requires explicit activation of the enabled destructive confirm button', async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    renderModal(props);

    const input = screen.getByRole('textbox');
    const confirmButton = screen.getByRole('button', { name: 'Delete' });

    await user.click(input);
    await user.keyboard('{Enter}');
    expect(props.onConfirm).not.toHaveBeenCalled();

    await user.type(input, 'DELETE');
    await user.keyboard('{Enter}');
    expect(props.onConfirm).not.toHaveBeenCalled();

    await user.click(confirmButton);
    expect(props.onConfirm).toHaveBeenCalledWith(props.confirmPayload);
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

  it('clears the provided confirm payload when the modal is closed without confirming', () => {
    const props = defaultProps();
    const { rerender } = renderModal(props);

    rerender(
      <IntlProvider locale="en" messages={{}}>
        <TypeXToConfirmModal {...props} isOpen={false} />
      </IntlProvider>,
    );

    expect(props.setConfirmPayload).toHaveBeenCalledWith(null);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });
});

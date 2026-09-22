import { Formik } from 'formik';
import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import FormikControl from './FormikControl';

const renderControl = (props: Record<string, any> = {}) =>
  render(
    <Formik initialValues={{ field: 'initial' }} onSubmit={() => {}}>
      <FormikControl
        name="field"
        aria-label="Field label"
        value="initial"
        {...props}
      />
    </Formik>,
  );

describe('<FormikControl />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders an enabled control when readOnly is not provided (default false)', () => {
    renderControl();

    // Exercises the `readOnly = false` default parameter branch.
    expect(screen.getByRole('textbox', { name: 'Field label' })).not.toBeDisabled();
  });

  it('renders an enabled control when readOnly is explicitly false', () => {
    renderControl({ readOnly: false });

    expect(screen.getByRole('textbox', { name: 'Field label' })).not.toBeDisabled();
  });

  it('disables the control when readOnly is true', () => {
    renderControl({ readOnly: true });

    expect(screen.getByRole('textbox', { name: 'Field label' })).toBeDisabled();
  });

  it('calls setFieldValue with the new value when provided', async () => {
    const user = userEvent.setup();
    const setFieldValue = jest.fn();
    renderControl({ setFieldValue });

    await user.type(screen.getByRole('textbox', { name: 'Field label' }), 'X');

    expect(setFieldValue).toHaveBeenCalledWith('field', expect.any(String));
  });

  it('does not fire change events when disabled', async () => {
    const user = userEvent.setup();
    const setFieldValue = jest.fn();
    renderControl({ setFieldValue, readOnly: true });

    await user.type(screen.getByRole('textbox', { name: 'Field label' }), 'X');

    expect(setFieldValue).not.toHaveBeenCalled();
  });
});

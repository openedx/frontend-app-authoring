import userEvent from '@testing-library/user-event';
import { render, fireEvent, initializeMocks } from '@src/testUtils';
import NumberInput, { NumberInputProps } from './NumberInput';

const renderInput = ({
  name = 'maxAttempts',
  displayName = 'Maximum Attempts',
  onChange = jest.fn(),
  onBlur = jest.fn(),
  value,
  placeholder,
}: Partial<NumberInputProps> = {}) =>
  render(
    <NumberInput
      name={name}
      displayName={displayName}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
      placeholder={placeholder}
    />,
  );

describe('<NumberInput />', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    initializeMocks();
    user = userEvent.setup();
  });

  it('renders with the correct numeric value', () => {
    const { getByRole } = renderInput({ value: 3, onChange: jest.fn() });
    expect(getByRole('textbox')).toHaveValue('3');
  });

  it('renders empty when value is null', () => {
    const { getByRole } = renderInput({ value: null, onChange: jest.fn() });
    expect(getByRole('textbox')).toHaveValue('');
  });

  it('calls onChange with the new numeric string when a number is typed', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 3, onChange });
    fireEvent.change(getByRole('textbox'), { target: { value: '35' } });
    expect(onChange).toHaveBeenCalledWith('35');
  });

  it('does not call onChange when a non-numeric character is typed', () => {
    // Regression test: typing a letter was triggering the save prompt
    // even though the field value was unchanged (the letter was filtered out).
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 3, onChange });
    fireEvent.change(getByRole('textbox'), { target: { value: '3a' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onChange when a letter is typed into an empty field', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: null, onChange });
    fireEvent.change(getByRole('textbox'), { target: { value: 'abc' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange when the field is cleared', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 3, onChange });
    fireEvent.change(getByRole('textbox'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('calls onBlur when focus leaves the field', async () => {
    const onBlur = jest.fn();
    const { getByRole } = renderInput({ value: 3, onChange: jest.fn(), onBlur });
    await user.click(getByRole('textbox'));
    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('renders with empty value when no value prop is provided', () => {
    // Covers the default value='' parameter branch (L14).
    const { getByRole } = renderInput({ onChange: jest.fn() });
    expect(getByRole('textbox')).toHaveValue('');
  });

  it('uses name as aria-label when displayName is empty', () => {
    // Covers the displayName || name fallback branch (L36).
    const { getByRole } = renderInput({ value: 3, onChange: jest.fn(), displayName: '' });
    expect(getByRole('textbox')).toHaveAttribute('aria-label', 'maxAttempts');
  });
});

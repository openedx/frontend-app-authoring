import { render, fireEvent, initializeMocks } from '@src/testUtils';
import NumberInput from './NumberInput';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderInput = (props: Record<string, any> = {}) => render(
  // eslint-disable-next-line react/jsx-props-no-spreading
  <NumberInput name="maxAttempts" displayName="Maximum Attempts" onBlur={jest.fn()} {...(props as any)} />,
);

describe('<NumberInput />', () => {
  beforeEach(() => { initializeMocks(); });

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

  it('calls onBlur when focus leaves the field', () => {
    const onBlur = jest.fn();
    const { getByRole } = renderInput({ value: 3, onChange: jest.fn(), onBlur });
    fireEvent.blur(getByRole('textbox'));
    expect(onBlur).toHaveBeenCalled();
  });
});

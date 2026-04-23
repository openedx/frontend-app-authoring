import { render, fireEvent, initializeMocks } from '@src/testUtils';
import StringInput from './StringInput';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderInput = (props: Record<string, any> = {}) =>
  render(
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StringInput name="displayName" displayName="Display Name" onBlur={jest.fn()} {...(props as any)} />,
  );

describe('<StringInput />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders with the correct value', () => {
    const { getByRole } = renderInput({ value: 'My Course', onChange: jest.fn() });
    expect(getByRole('textbox')).toHaveValue('My Course');
  });

  it('renders empty when value is an empty string', () => {
    const { getByRole } = renderInput({ value: '', onChange: jest.fn() });
    expect(getByRole('textbox')).toHaveValue('');
  });

  it('calls onChange with the new value when text is entered', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: '', onChange });
    fireEvent.change(getByRole('textbox'), { target: { value: 'New Course Name' } });
    expect(onChange).toHaveBeenCalledWith('New Course Name');
  });

  it('calls onChange on every keystroke', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'My', onChange });
    fireEvent.change(getByRole('textbox'), { target: { value: 'My ' } });
    fireEvent.change(getByRole('textbox'), { target: { value: 'My C' } });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('calls onBlur when focus leaves the field', () => {
    const onBlur = jest.fn();
    const { getByRole } = renderInput({ value: 'My Course', onChange: jest.fn(), onBlur });
    fireEvent.blur(getByRole('textbox'));
    expect(onBlur).toHaveBeenCalled();
  });

  it('does not call onBlur when the field is changed (only on focus loss)', () => {
    const onBlur = jest.fn();
    const { getByRole } = renderInput({ value: '', onChange: jest.fn(), onBlur });
    fireEvent.change(getByRole('textbox'), { target: { value: 'typing...' } });
    expect(onBlur).not.toHaveBeenCalled();
  });
});

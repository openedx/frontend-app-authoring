import { render, fireEvent, initializeMocks } from '@src/testUtils';
import EnumInput from './EnumInput';
import { ENUM_OPTIONS } from '../../data/fieldTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderInput = (props: Record<string, any> = {}) =>
  render(
    // eslint-disable-next-line react/jsx-props-no-spreading
    <EnumInput name="showanswer" displayName="Show Answer" {...(props as any)} />,
  );

describe('<EnumInput />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders the correct options for the given field name', () => {
    const { getAllByRole } = renderInput({ value: 'always', onChange: jest.fn() });
    const options = getAllByRole('option');
    const expectedValues = ENUM_OPTIONS.showanswer.map((o) => o.value);
    expect(options.map((o: HTMLOptionElement) => o.value)).toEqual(expectedValues);
  });

  it('shows the current value as selected', () => {
    const { getByRole } = renderInput({ value: 'never', onChange: jest.fn() });
    expect(getByRole('combobox')).toHaveValue('never');
  });

  it('calls onChange with the selected value when the selection changes', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    fireEvent.change(getByRole('combobox'), { target: { value: 'never' } });
    expect(onChange).toHaveBeenCalledWith('never');
  });

  it('calls onChange only once per change event', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    fireEvent.change(getByRole('combobox'), { target: { value: 'past_due' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange when the field is blurred', () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    fireEvent.blur(getByRole('combobox'));
    expect(onChange).toHaveBeenCalledWith('always');
  });

  it('uses name as aria-label when displayName is empty', () => {
    const { getByRole } = renderInput({ value: 'always', onChange: jest.fn(), displayName: '' });
    expect(getByRole('combobox')).toHaveAttribute('aria-label', 'showanswer');
  });

  it('renders an empty select when the field name has no ENUM_OPTIONS entry', () => {
    const { getByRole } = renderInput({ name: 'unknownField', value: '', onChange: jest.fn() });
    expect(getByRole('combobox')).toBeInTheDocument();
    expect(getByRole('combobox').children).toHaveLength(0);
  });

  it('renders without crashing when no value prop is provided', () => {
    // Covers the default value='' parameter branch (L13).
    const { getByRole } = renderInput({ onChange: jest.fn() });
    expect(getByRole('combobox')).toBeInTheDocument();
  });

  it('renders without crashing when value is null', () => {
    // Covers the `value ?? ""` null branch (L24).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { getByRole } = renderInput({ value: null as any, onChange: jest.fn() });
    expect(getByRole('combobox')).toBeInTheDocument();
  });
});

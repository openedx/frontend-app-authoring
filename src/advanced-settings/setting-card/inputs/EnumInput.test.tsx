import userEvent from '@testing-library/user-event';
import { render, initializeMocks } from '@src/testUtils';
import EnumInput, { EnumInputProps } from './EnumInput';
import { ENUM_OPTIONS } from '../../data/fieldTypes';

const renderInput = ({
  name = 'showanswer',
  displayName = 'Show Answer',
  value = 'always',
  onChange = jest.fn(),
}: Partial<EnumInputProps> = {}) =>
  render(<EnumInput name={name} displayName={displayName} value={value} onChange={onChange} />);

describe('<EnumInput />', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    initializeMocks();
    user = userEvent.setup();
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

  it('calls onChange with the selected value when the selection changes', async () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    await user.selectOptions(getByRole('combobox'), 'never');
    expect(onChange).toHaveBeenCalledWith('never');
  });

  it('calls onChange only once per change event', async () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    await user.selectOptions(getByRole('combobox'), 'past_due');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange when the field is blurred', async () => {
    const onChange = jest.fn();
    const { getByRole } = renderInput({ value: 'always', onChange });
    await user.click(getByRole('combobox'));
    await user.tab();
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
